import { File } from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import type { Categoria, ColorProducto, DatosProductoGenerales, Producto, VarianteProducto } from '@/types';
import { mapearProducto, type FilaProductoSupabase } from './mappers/mapearProducto';

const BUCKET_IMAGENES_PRODUCTO = 'productos';

const SELECT_PRODUCTO = `
  id, sku, nombre, categoria_id, precio, precio_anterior, descripcion, composicion,
  confeccion, origen, etiquetas, es_novedad, popularidad_30d, fecha_alta, activo,
  categorias ( id, nombre ),
  variantes_producto ( id, talla, color_id, stock, colores ( id, nombre, hex ) ),
  imagenes_producto ( id, url, orden )
`;

function requerirSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado en este entorno (faltan EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY).',
    );
  }
  return supabase;
}

function generarIdProducto(nombre: string): string {
  const base = nombre
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
  return `${base || 'producto'}-${Date.now().toString(36)}`;
}

export const PRODUCTOS_POR_PAGINA = 20;

export interface OpcionesPaginaCatalogo {
  /** 'todo' o undefined: sin filtro de categoría. */
  categoriaId?: string;
  busqueda?: string;
  precioMax?: number | null;
  tallas?: string[];
  colores?: string[];
  soloDisponibles?: boolean;
  orden?: 'novedad' | 'precio' | 'popularidad';
  /** Empieza en 1. */
  pagina?: number;
}

export interface PaginaCatalogo {
  productos: Producto[];
  hayMas: boolean;
  /** Total de productos que cumplen los filtros (para el contador de resultados). */
  total: number;
}

// El término va dentro de un filtro `or(...)` de PostgREST: se quitan los
// caracteres que rompen esa sintaxis o que ilike trata como comodines.
function limpiarTerminoBusqueda(termino: string): string {
  return termino.replace(/[%_,()"\\*]/g, ' ').trim();
}

async function obtenerProductoPorIdInterno(id: string): Promise<Producto | undefined> {
  const { data, error } = await requerirSupabase()
    .from('productos')
    .select(SELECT_PRODUCTO)
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`No se pudo cargar el producto "${id}": ${error.message}`);
  return data ? mapearProducto(data as unknown as FilaProductoSupabase) : undefined;
}

export const servicioProductos = {
  /** Catálogo público: solo productos activos. */
  async obtenerProductos(): Promise<Producto[]> {
    const { data, error } = await requerirSupabase()
      .from('productos')
      .select(SELECT_PRODUCTO)
      .eq('activo', true)
      .order('fecha_alta', { ascending: false });

    if (error) throw new Error(`No se pudieron cargar los productos: ${error.message}`);
    return (data ?? []).map((fila) => mapearProducto(fila as unknown as FilaProductoSupabase));
  },

  /** Panel admin: incluye los inactivos para poder volver a activarlos. */
  async obtenerProductosAdmin(): Promise<Producto[]> {
    const { data, error } = await requerirSupabase()
      .from('productos')
      .select(SELECT_PRODUCTO)
      .order('fecha_alta', { ascending: false })
      // fecha_alta es solo fecha: sin este desempate, los productos del mismo
      // día podían volver en otro orden después de editarlos.
      .order('id', { ascending: true });

    if (error) throw new Error(`No se pudieron cargar los productos: ${error.message}`);
    return (data ?? []).map((fila) => mapearProducto(fila as unknown as FilaProductoSupabase));
  },

  /**
   * Catálogo paginado en el servidor, de PRODUCTOS_POR_PAGINA en
   * PRODUCTOS_POR_PAGINA. Replica los filtros que antes hacía useCatalogo en
   * memoria: búsqueda por nombre o categoría, precio máximo, tallas y colores
   * con stock, y solo disponibles.
   */
  async obtenerPaginaCatalogo({
    categoriaId,
    busqueda = '',
    precioMax = null,
    tallas = [],
    colores = [],
    soloDisponibles = false,
    orden = 'novedad',
    pagina = 1,
  }: OpcionesPaginaCatalogo = {}): Promise<PaginaCatalogo> {
    const cliente = requerirSupabase();

    // Cada filtro por variantes usa su propio embed `!inner` con alias: así
    // filtra qué productos vuelven sin recortar `variantes_producto`, que
    // sigue trayendo todas las variantes del producto. Son embeds separados
    // porque, igual que antes, la talla y el color pueden cumplirse en
    // variantes distintas.
    const embedsFiltro: string[] = [];
    if (tallas.length > 0) embedsFiltro.push('filtro_talla:variantes_producto!inner(talla, stock)');
    if (colores.length > 0) embedsFiltro.push('filtro_color:variantes_producto!inner(color_id, stock)');
    if (soloDisponibles) embedsFiltro.push('filtro_stock:variantes_producto!inner(stock)');
    const select = [SELECT_PRODUCTO, ...embedsFiltro].join(',\n');

    let consulta = cliente
      .from('productos')
      .select(select, { count: 'exact' })
      .eq('activo', true);

    if (categoriaId && categoriaId !== 'todo') consulta = consulta.eq('categoria_id', categoriaId);
    if (precioMax != null) consulta = consulta.lte('precio', precioMax);
    if (tallas.length > 0) consulta = consulta.gt('filtro_talla.stock', 0).in('filtro_talla.talla', tallas);
    if (colores.length > 0) consulta = consulta.gt('filtro_color.stock', 0).in('filtro_color.color_id', colores);
    if (soloDisponibles) consulta = consulta.gt('filtro_stock.stock', 0);

    const termino = limpiarTerminoBusqueda(busqueda);
    if (termino) {
      // Antes la búsqueda también coincidía con el nombre de la categoría:
      // se buscan esas categorías primero y se combinan con un `or`.
      const { data: categoriasCoincidentes, error: errorCategorias } = await cliente
        .from('categorias')
        .select('id')
        .ilike('nombre', `%${termino}%`);
      if (errorCategorias) throw new Error(`No se pudo buscar en las categorías: ${errorCategorias.message}`);
      const ids = (categoriasCoincidentes ?? []).map((fila) => `"${(fila as { id: string }).id}"`);
      consulta =
        ids.length > 0
          ? consulta.or(`nombre.ilike.%${termino}%,categoria_id.in.(${ids.join(',')})`)
          : consulta.ilike('nombre', `%${termino}%`);
    }

    if (orden === 'precio') consulta = consulta.order('precio', { ascending: true });
    if (orden === 'popularidad') consulta = consulta.order('popularidad_30d', { ascending: false });
    // Desempate estable: sin él, productos empatados podían repetirse o
    // saltarse entre una página y la siguiente.
    consulta = consulta.order('fecha_alta', { ascending: false }).order('id', { ascending: true });

    const desde = (Math.max(1, pagina) - 1) * PRODUCTOS_POR_PAGINA;
    const { data, error, count } = await consulta.range(desde, desde + PRODUCTOS_POR_PAGINA - 1);
    if (error) throw new Error(`No se pudieron cargar los productos: ${error.message}`);

    const productos = (data ?? []).map((fila) => mapearProducto(fila as unknown as FilaProductoSupabase));
    const total = count ?? desde + productos.length;
    return { productos, hayMas: desde + productos.length < total, total };
  },

  // Sin filtro de `activo` a propósito: carrito, favoritos y admin necesitan
  // leer también productos desactivados para marcarlos como no disponibles.
  async obtenerProductoPorId(id: string): Promise<Producto | undefined> {
    return obtenerProductoPorIdInterno(id);
  },

  async obtenerNovedades(limite = 4): Promise<Producto[]> {
    const { data, error } = await requerirSupabase()
      .from('productos')
      .select(SELECT_PRODUCTO)
      .eq('es_novedad', true)
      .eq('activo', true)
      .order('fecha_alta', { ascending: false })
      .limit(limite);

    if (error) throw new Error(`No se pudieron cargar las novedades: ${error.message}`);
    return (data ?? []).map((fila) => mapearProducto(fila as unknown as FilaProductoSupabase));
  },

  async obtenerCategorias(): Promise<Categoria[]> {
    const cliente = requerirSupabase();
    const [{ data: filasCategorias, error: errorCategorias }, { data: filasProductos, error: errorProductos }] =
      await Promise.all([
        cliente.from('categorias').select('id, nombre, subcategorias, imagen_url'),
        cliente.from('productos').select('categoria_id, activo').eq('activo', true),
      ]);

    if (errorCategorias) throw new Error(`No se pudieron cargar las categorías: ${errorCategorias.message}`);
    if (errorProductos) throw new Error(`No se pudo calcular el conteo por categoría: ${errorProductos.message}`);

    const conteos = new Map<string, number>();
    for (const fila of filasProductos ?? []) {
      const clave = (fila as { categoria_id: string }).categoria_id;
      conteos.set(clave, (conteos.get(clave) ?? 0) + 1);
    }

    return (filasCategorias ?? []).map((fila) => {
      const tipada = fila as {
        id: string;
        nombre: string;
        subcategorias: string[] | null;
        imagen_url: string | null;
      };
      return {
        id: tipada.id,
        nombre: tipada.nombre,
        subcategorias: tipada.subcategorias ?? [],
        conteoArticulos: conteos.get(tipada.id) ?? 0,
        imagenUrl: tipada.imagen_url ?? undefined,
      };
    });
  },

  async obtenerCategoriaPorId(id: string): Promise<Categoria | undefined> {
    const categorias = await servicioProductos.obtenerCategorias();
    return categorias.find((categoria) => categoria.id === id);
  },

  async obtenerColores(): Promise<ColorProducto[]> {
    const { data, error } = await requerirSupabase().from('colores').select('id, nombre, hex');
    if (error) throw new Error(`No se pudieron cargar los colores: ${error.message}`);
    return (data ?? []) as ColorProducto[];
  },

  async subirImagen(uri: string, contentType = 'image/jpeg'): Promise<string> {
    const cliente = requerirSupabase();
    const extension = contentType.split('/')[1] ?? 'jpg';
    const ruta = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const archivo = new File(uri);
    const bytes = await archivo.arrayBuffer();

    const { error } = await cliente.storage.from(BUCKET_IMAGENES_PRODUCTO).upload(ruta, bytes, { contentType });
    if (error) throw new Error(`No se pudo subir la foto: ${error.message}`);

    const { data } = cliente.storage.from(BUCKET_IMAGENES_PRODUCTO).getPublicUrl(ruta);
    return data.publicUrl;
  },

  async crearProducto(
    datos: DatosProductoGenerales & { variantes: VarianteProducto[]; imagenes: string[] },
  ): Promise<Producto> {
    const cliente = requerirSupabase();
    const id = generarIdProducto(datos.nombre);

    const { error: errorProducto } = await cliente.from('productos').insert({
      id,
      sku: datos.sku,
      nombre: datos.nombre,
      categoria_id: datos.categoriaId,
      precio: datos.precio,
      precio_anterior: datos.precioAnterior ?? null,
      descripcion: datos.descripcion,
      composicion: datos.composicion,
      confeccion: datos.confeccion,
      origen: datos.origen,
      etiquetas: datos.etiquetas,
      es_novedad: datos.esNovedad,
      popularidad_30d: 0,
      fecha_alta: new Date().toISOString().slice(0, 10),
      activo: true,
    });
    if (errorProducto) {
      if (errorProducto.code === '23505') {
        throw new Error(`Ya existe un producto con el SKU "${datos.sku}".`);
      }
      throw new Error(`No se pudo crear el producto: ${errorProducto.message}`);
    }

    if (datos.variantes.length > 0) {
      const { error: errorVariantes } = await cliente.from('variantes_producto').insert(
        datos.variantes.map((v) => ({ producto_id: id, talla: v.talla, color_id: v.colorId, stock: v.stock })),
      );
      if (errorVariantes) {
        throw new Error(`El producto se creó, pero no se pudieron guardar las variantes: ${errorVariantes.message}`);
      }
    }

    if (datos.imagenes.length > 0) {
      const { error: errorImagenes } = await cliente.from('imagenes_producto').insert(
        datos.imagenes.map((url, orden) => ({ producto_id: id, url, orden })),
      );
      if (errorImagenes) {
        throw new Error(`El producto se creó, pero no se pudieron guardar las fotos: ${errorImagenes.message}`);
      }
    }

    const creado = await obtenerProductoPorIdInterno(id);
    if (!creado) throw new Error('El producto se creó pero no se pudo volver a leer.');
    return creado;
  },

  async actualizarProducto(id: string, datos: DatosProductoGenerales): Promise<Producto> {
    const cliente = requerirSupabase();
    const { error } = await cliente
      .from('productos')
      .update({
        nombre: datos.nombre,
        categoria_id: datos.categoriaId,
        precio: datos.precio,
        precio_anterior: datos.precioAnterior ?? null,
        descripcion: datos.descripcion,
        composicion: datos.composicion,
        confeccion: datos.confeccion,
        origen: datos.origen,
        etiquetas: datos.etiquetas,
        es_novedad: datos.esNovedad,
      })
      .eq('id', id);
    if (error) throw new Error(`No se pudo actualizar el producto: ${error.message}`);

    const actualizado = await obtenerProductoPorIdInterno(id);
    if (!actualizado) throw new Error(`El producto "${id}" no existe.`);
    return actualizado;
  },

  async actualizarVariantesEImagenes(
    id: string,
    variantes: VarianteProducto[],
    imagenes: string[],
  ): Promise<Producto> {
    const cliente = requerirSupabase();
    const { data: usuarioActual } = await cliente.auth.getUser();
    const creadoPor = usuarioActual.user?.id ?? null;

    const { data: existentes, error: errorLectura } = await cliente
      .from('variantes_producto')
      .select('id, talla, color_id, stock')
      .eq('producto_id', id);
    if (errorLectura) throw new Error(`No se pudieron leer las variantes actuales: ${errorLectura.message}`);

    const clave = (talla: string, colorId: string) => `${talla}__${colorId}`;
    const mapaExistentes = new Map(
      ((existentes ?? []) as { id: string; talla: string; color_id: string; stock: number }[]).map((v) => [
        clave(v.talla, v.color_id),
        v,
      ]),
    );
    const clavesNuevas = new Set(variantes.map((v) => clave(v.talla, v.colorId)));
    const movimientos: { variante_id: string; tipo: 'ingreso' | 'ajuste'; cantidad: number; creado_por: string | null }[] = [];

    for (const variante of variantes) {
      const existente = mapaExistentes.get(clave(variante.talla, variante.colorId));
      if (!existente) {
        const { data: creada, error } = await cliente
          .from('variantes_producto')
          .insert({ producto_id: id, talla: variante.talla, color_id: variante.colorId, stock: variante.stock })
          .select('id')
          .single();
        if (error) throw new Error(`No se pudo crear la variante ${variante.talla}/${variante.colorId}: ${error.message}`);
        if (variante.stock > 0) {
          movimientos.push({ variante_id: (creada as { id: string }).id, tipo: 'ingreso', cantidad: variante.stock, creado_por: creadoPor });
        }
      } else if (existente.stock !== variante.stock) {
        const { error } = await cliente
          .from('variantes_producto')
          .update({ stock: variante.stock })
          .eq('id', existente.id);
        if (error) throw new Error(`No se pudo actualizar el stock de ${variante.talla}/${variante.colorId}: ${error.message}`);
        movimientos.push({
          variante_id: existente.id,
          tipo: 'ajuste',
          cantidad: variante.stock - existente.stock,
          creado_por: creadoPor,
        });
      }
    }

    const idsAEliminar = [...mapaExistentes.entries()]
      .filter(([claveExistente]) => !clavesNuevas.has(claveExistente))
      .map(([, v]) => v.id);
    if (idsAEliminar.length > 0) {
      const { error: errorEliminar } = await cliente.from('variantes_producto').delete().in('id', idsAEliminar);
      if (errorEliminar) {
        throw new Error(
          `No se pudieron quitar algunas variantes (puede que ya tengan pedidos asociados): ${errorEliminar.message}`,
        );
      }
    }

    if (movimientos.length > 0) {
      const { error: errorMovimientos } = await cliente.from('movimientos_stock').insert(
        movimientos.map((m) => ({ variante_id: m.variante_id, tipo: m.tipo, cantidad: m.cantidad, creado_por: m.creado_por })),
      );
      if (errorMovimientos) console.error('No se pudo registrar el movimiento de stock.', errorMovimientos);
    }

    const { error: errorBorrarImagenes } = await cliente
      .from('imagenes_producto')
      .delete()
      .eq('producto_id', id);
    if (errorBorrarImagenes) {
      throw new Error(`No se pudieron actualizar las fotos: ${errorBorrarImagenes.message}`);
    }
    if (imagenes.length > 0) {
      const { error: errorImagenes } = await cliente.from('imagenes_producto').insert(
        imagenes.map((url, orden) => ({ producto_id: id, url, orden })),
      );
      if (errorImagenes) throw new Error(`No se pudieron guardar las fotos: ${errorImagenes.message}`);
    }

    const actualizado = await obtenerProductoPorIdInterno(id);
    if (!actualizado) throw new Error(`El producto "${id}" no existe.`);
    return actualizado;
  },

  // Dos viajes en vez de tres: se lee solo la columna `activo` y el update
  // devuelve el producto completo en la misma respuesta.
  async alternarActivo(id: string): Promise<Producto> {
    const cliente = requerirSupabase();
    const { data: actual, error: errorLectura } = await cliente
      .from('productos')
      .select('activo')
      .eq('id', id)
      .maybeSingle();
    if (errorLectura) throw new Error(`No se pudo leer el estado del producto: ${errorLectura.message}`);
    if (!actual) throw new Error(`El producto "${id}" no existe.`);

    const { data, error } = await cliente
      .from('productos')
      .update({ activo: !(actual as { activo: boolean }).activo })
      .eq('id', id)
      .select(SELECT_PRODUCTO)
      .single();
    if (error) throw new Error(`No se pudo cambiar el estado del producto: ${error.message}`);
    return mapearProducto(data as unknown as FilaProductoSupabase);
  },
};
