// ============================================================
// STUDIO HAIR - Datos seed y modelo de datos
// ============================================================

const SH = {
  brand: {
    name: "Studio Hair",
    tagline: "Tu estilo, nuestra pasión",
    slogan: "Donde cada corte cuenta una historia",
    phone: "+54 11 4567-8900",
    email: "hola@studiohair.com.ar",
    instagram: "@studiohair_ar",
    facebook: "Studio Hair Argentina",
    year: 2015,
  },

  // ----------------------------------------------------------
  // SUCURSALES
  // ----------------------------------------------------------
  branches: [
    {
      id: "b1",
      name: "Studio Hair Palermo",
      address: "Thames 1650, Palermo",
      city: "Buenos Aires",
      phone: "+54 11 4567-8900",
      email: "palermo@studiohair.com.ar",
      map_url: "https://maps.google.com/?q=Thames+1650+Palermo+Buenos+Aires",
      map_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.1!2d-58.43!3d-34.59!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sPalermo%2C%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1234567890",
      hours: {
        lun: "09:00–20:00",
        mar: "09:00–20:00",
        mie: "09:00–20:00",
        jue: "09:00–20:00",
        vie: "09:00–21:00",
        sab: "09:00–19:00",
        dom: "Cerrado",
      },
      image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80",
      active: true,
    },
    {
      id: "b2",
      name: "Studio Hair Villa Crespo",
      address: "Av. Corrientes 4820, Villa Crespo",
      city: "Buenos Aires",
      phone: "+54 11 4891-2233",
      email: "villacrespo@studiohair.com.ar",
      map_url: "https://maps.google.com/?q=Av+Corrientes+4820+Villa+Crespo+Buenos+Aires",
      map_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.1!2d-58.44!3d-34.60!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sVilla%20Crespo%2C%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1234567890",
      hours: {
        lun: "09:00–20:00",
        mar: "09:00–20:00",
        mie: "09:00–20:00",
        jue: "09:00–20:00",
        vie: "09:00–20:00",
        sab: "10:00–18:00",
        dom: "Cerrado",
      },
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
      active: true,
    },
  ],

  // ----------------------------------------------------------
  // SERVICIOS
  // ----------------------------------------------------------
  services: [
    // Cortes
    {
      id: "s1", category: "corte", name: "Corte de cabello mujer",
      description: "Corte personalizado según tu tipo de rostro y estilo. Incluye lavado y secado.",
      price: 5500, duration: 60, buffer: 10,
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80",
      popular: true, active: true,
    },
    {
      id: "s2", category: "corte", name: "Corte de cabello hombre",
      description: "Corte clásico o moderno con navaja o tijera. Incluye lavado y styling.",
      price: 3800, duration: 45, buffer: 10,
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
      popular: true, active: true,
    },
    {
      id: "s3", category: "corte", name: "Corte infantil (hasta 12 años)",
      description: "Corte divertido y cómodo para los más chicos. Con paciencia y cariño.",
      price: 2800, duration: 30, buffer: 10,
      image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=600&q=80",
      popular: false, active: true,
    },
    // Color
    {
      id: "s4", category: "color", name: "Coloración completa",
      description: "Tintura de raíz a puntas con productos premium. Incluye tratamiento post-color.",
      price: 9500, duration: 120, buffer: 15,
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
      popular: true, active: true,
    },
    {
      id: "s5", category: "color", name: "Balayage / Mechas californianas",
      description: "Técnica de coloración degradada natural. El resultado: sol en el cabello.",
      price: 15000, duration: 180, buffer: 15,
      image: "https://images.unsplash.com/photo-1595499024481-56a0190bfb4a?w=600&q=80",
      popular: true, active: true,
    },
    {
      id: "s6", category: "color", name: "Retoque de raíz",
      description: "Renovación del color desde la raíz. Tonos a medida.",
      price: 6500, duration: 90, buffer: 15,
      image: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=600&q=80",
      popular: false, active: true,
    },
    {
      id: "s7", category: "color", name: "Decoloración + color fantasía",
      description: "Decoloración segura y colores vibrantes. Incluye tratamiento reparador.",
      price: 18000, duration: 210, buffer: 15,
      image: "https://images.unsplash.com/photo-1598524374912-f895b7a5f61d?w=600&q=80",
      popular: false, active: true,
    },
    // Barber
    {
      id: "s8", category: "barber", name: "Arreglo de barba",
      description: "Diseño, contorno y acabado de barba con navaja recta. Resultado impecable.",
      price: 2500, duration: 30, buffer: 10,
      image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80",
      popular: true, active: true,
    },
    {
      id: "s9", category: "barber", name: "Corte + barba (combo)",
      description: "El combo estrella. Corte de cabello y arreglo completo de barba.",
      price: 5800, duration: 70, buffer: 10,
      image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80",
      popular: true, active: true,
    },
    // Tratamientos
    {
      id: "s10", category: "tratamiento", name: "Keratina brasilera",
      description: "Alisado progresivo con keratina. Elimina el frizz por hasta 4 meses.",
      price: 22000, duration: 180, buffer: 20,
      image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&q=80",
      popular: true, active: true,
    },
    {
      id: "s11", category: "tratamiento", name: "Hidratación profunda",
      description: "Mascarilla nutritiva + vapor. Devuelve brillo y suavidad instantánea.",
      price: 5500, duration: 60, buffer: 10,
      image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80",
      popular: false, active: true,
    },
    {
      id: "s12", category: "tratamiento", name: "Botox capilar",
      description: "Relleno de fibra capilar. Ideal para cabello dañado, reseco o con frizz.",
      price: 14000, duration: 120, buffer: 15,
      image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80",
      popular: false, active: true,
    },
    // Peinados
    {
      id: "s13", category: "peinado", name: "Peinado de evento",
      description: "Recogido, ondas, trenzas o brushing especial para tu occasion especial.",
      price: 8500, duration: 90, buffer: 15,
      image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&q=80",
      popular: false, active: true,
    },
    {
      id: "s14", category: "peinado", name: "Brushing + styling",
      description: "Lavado, secado profesional y styling. Quedate impecable en 45 minutos.",
      price: 4200, duration: 45, buffer: 10,
      image: "https://images.unsplash.com/photo-1560869713-bf06b2bc7a9e?w=600&q=80",
      popular: false, active: true,
    },
    // Uñas
    {
      id: "s15", category: "unas", name: "Manicura semipermanente",
      description: "Esmalte semipermanente de larga duración. Más de 200 colores disponibles.",
      price: 4500, duration: 60, buffer: 10,
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
      popular: false, active: true,
    },
  ],

  // ----------------------------------------------------------
  // PROFESIONALES
  // ----------------------------------------------------------
  staff: [
    {
      id: "p1", name: "Valeria Romero", role: "Directora técnica & Colorista senior",
      bio: "Con más de 12 años de experiencia, Valeria es especialista en coloración avanzada y técnicas de balayage. Formada en Buenos Aires y Madrid.",
      specialties: ["Coloración", "Balayage", "Keratina"],
      rating: 4.9, reviews: 148, branch_id: "b1",
      services: ["s4","s5","s6","s7","s10","s11","s12"],
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
      instagram: "@vale_studiohair",
      active: true,
    },
    {
      id: "p2", name: "Martín Gómez", role: "Barber & Estilista",
      bio: "Martín fusiona técnicas de barbería clásica con tendencias urbanas actuales. Especialista en fades y diseños creativos.",
      specialties: ["Barber", "Fades", "Cortes masculinos"],
      rating: 4.8, reviews: 203, branch_id: "b1",
      services: ["s2","s8","s9","s1"],
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
      instagram: "@martin_barber",
      active: true,
    },
    {
      id: "p3", name: "Camila Torres", role: "Estilista & Peinadora",
      bio: "Camila es experta en peinados de novia y eventos. Su pasión por los detalles la distingue en cada look que crea.",
      specialties: ["Peinados de evento", "Trenzas", "Ondas"],
      rating: 4.9, reviews: 87, branch_id: "b1",
      services: ["s1","s13","s14","s11"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      instagram: "@cami_hair",
      active: true,
    },
    {
      id: "p4", name: "Diego Fernández", role: "Colorista & Técnico",
      bio: "Diego se especializa en coloraciones fantasía y técnicas de decoloración segura. Fanático de los colores vibrantes.",
      specialties: ["Color fantasía", "Decoloración", "Balayage"],
      rating: 4.7, reviews: 95, branch_id: "b1",
      services: ["s4","s5","s6","s7","s12"],
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      instagram: "@diego_color",
      active: true,
    },
    {
      id: "p5", name: "Luciana Paz", role: "Estilista senior",
      bio: "Luciana tiene un ojo especial para los cortes que favorecen cada tipo de rostro. 8 años transformando looks.",
      specialties: ["Cortes de mujer", "Brushing", "Tratamientos"],
      rating: 4.8, reviews: 112, branch_id: "b2",
      services: ["s1","s3","s10","s11","s12","s14"],
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      instagram: "@luci_paz_hair",
      active: true,
    },
    {
      id: "p6", name: "Rodrigo Blanco", role: "Barber",
      bio: "Rodrigo es el rey de la navaja recta. Especialista en cortes masculinos clásicos y modernos en Villa Crespo.",
      specialties: ["Barber", "Navaja", "Degradados"],
      rating: 4.9, reviews: 178, branch_id: "b2",
      services: ["s2","s8","s9"],
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
      instagram: "@rodrigo_barber",
      active: true,
    },
    {
      id: "p7", name: "Sofía Mendez", role: "Colorista & Nail Artist",
      bio: "Sofía combina su talento en coloración con el arte de las uñas. Cada detalle importa.",
      specialties: ["Coloración", "Uñas", "Manicura"],
      rating: 4.7, reviews: 64, branch_id: "b2",
      services: ["s4","s6","s11","s15"],
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      instagram: "@sofi_nails_hair",
      active: true,
    },
    {
      id: "p8", name: "Facundo Ríos", role: "Estilista & Colorista",
      bio: "Facundo tiene pasión por los cambios de look radicales. Especialista en balayage y keratina.",
      specialties: ["Balayage", "Keratina", "Cortes"],
      rating: 4.8, reviews: 91, branch_id: "b2",
      services: ["s1","s2","s5","s10","s12","s14"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      instagram: "@facu_haircraft",
      active: true,
    },
  ],

  // ----------------------------------------------------------
  // PROMOCIONES
  // ----------------------------------------------------------
  promotions: [
    {
      id: "pr1",
      title: "Combo Mujer: Corte + Hidratación",
      description: "Renovate este mes. Corte de mujer + hidratación profunda con vapor. Resultado increíble.",
      discount: 20,
      original_price: 11000,
      promo_price: 8800,
      services: ["s1","s11"],
      start: "2026-02-01",
      end: "2026-03-31",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
      code: "COMBO20",
      active: true,
    },
    {
      id: "pr2",
      title: "Keratina March Special",
      description: "Marzo es el mes del cabello liso. 15% OFF en keratina brasilera. Disponible en ambas sucursales.",
      discount: 15,
      original_price: 22000,
      promo_price: 18700,
      services: ["s10"],
      start: "2026-03-01",
      end: "2026-03-31",
      image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80",
      code: "KERA15",
      active: true,
    },
    {
      id: "pr3",
      title: "Pack Barber: Corte + Barba 2x1",
      description: "Traé un amigo y paguen un sólo combo. El segundo combo tiene 50% de descuento.",
      discount: 50,
      original_price: 11600,
      promo_price: 8700,
      services: ["s9"],
      start: "2026-01-01",
      end: "2026-04-30",
      image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
      code: "BARBER2X1",
      active: true,
    },
    {
      id: "pr4",
      title: "Balayage Black Friday",
      description: "Promo finalizada. 25% OFF en balayage y mechas californianas.",
      discount: 25,
      original_price: 15000,
      promo_price: 11250,
      services: ["s5"],
      start: "2025-11-25",
      end: "2025-12-02",
      image: "https://images.unsplash.com/photo-1595499024481-56a0190bfb4a?w=800&q=80",
      code: "BLAY25",
      active: false,
    },
  ],

  // ----------------------------------------------------------
  // RESEÑAS
  // ----------------------------------------------------------
  reviews: [
    {
      id: "r1", name: "Agustina M.", rating: 5, branch_id: "b1", staff_id: "p1",
      text: "Valeria es una artista. Vine con el pelo destruido y salí con un balayage que no puedo parar de mostrarle a todos. Mil gracias.",
      date: "2026-02-15", approved: true,
    },
    {
      id: "r2", name: "Nicolás T.", rating: 5, branch_id: "b1", staff_id: "p2",
      text: "Martín me salvó la semana. El fade más limpio que tuve en años. El lugar es impecable y el trato excelente.",
      date: "2026-02-20", approved: true,
    },
    {
      id: "r3", name: "Florencia R.", rating: 5, branch_id: "b1", staff_id: "p3",
      text: "Camila me hizo el peinado para mi casamiento y fue exactamente lo que soñé. Durísimo, hermoso, perfecto.",
      date: "2026-01-30", approved: true,
    },
    {
      id: "r4", name: "Macarena L.", rating: 5, branch_id: "b2", staff_id: "p5",
      text: "La mejor peluquería del barrio sin dudas. Luciana entiende exactamente lo que querés sin que tengas que explicar de más.",
      date: "2026-02-10", approved: true,
    },
    {
      id: "r5", name: "Tomás G.", rating: 5, branch_id: "b2", staff_id: "p6",
      text: "Rodrigo es un crack. Me hice la barba con navaja por primera vez y fue una experiencia increíble. Volvería mil veces.",
      date: "2026-02-22", approved: true,
    },
    {
      id: "r6", name: "Valentina K.", rating: 4, branch_id: "b1", staff_id: "p4",
      text: "Diego me hizo un color fantasía precioso. Muy profesional y atento. El resultado me encantó. Recomendado.",
      date: "2026-01-18", approved: true,
    },
    {
      id: "r7", name: "Lucía B.", rating: 5, branch_id: "b2", staff_id: "p8",
      text: "Me hice la keratina con Facundo y es el mejor resultado que tuve. Sin frizz, brillante y suave. Durísimo.",
      date: "2026-02-05", approved: true,
    },
    {
      id: "r8", name: "Sebastián P.", rating: 5, branch_id: "b1", staff_id: "p2",
      text: "Lugar top. La reserva online fue súper fácil, llegué y me atendieron en el horario exacto. El corte, perfecto.",
      date: "2026-02-28", approved: true,
    },
    {
      id: "r9", name: "Julieta W.", rating: 5, branch_id: "b2", staff_id: "p7",
      text: "Sofía me hizo las uñas semipermanentes y una coloración increíble el mismo día. Multitasking de alto nivel.",
      date: "2026-02-14", approved: true,
    },
    {
      id: "r10", name: "Federico A.", rating: 4, branch_id: "b1", staff_id: "p1",
      text: "Primera vez en Studio Hair y ya soy cliente fijo. Precio justo, calidad altísima y el local re cómodo.",
      date: "2026-01-25", approved: true,
    },
  ],

  // ----------------------------------------------------------
  // GALERÍA
  // ----------------------------------------------------------
  gallery: [
    { id: "g1", title: "Balayage golden", category: "color", type: "after",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80" },
    { id: "g2", title: "Corte bob liso", category: "corte", type: "after",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80" },
    { id: "g3", title: "Barba perfecta", category: "barber", type: "after",
      image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80" },
    { id: "g4", title: "Color fantasía violeta", category: "color", type: "after",
      image: "https://images.unsplash.com/photo-1598524374912-f895b7a5f61d?w=600&q=80" },
    { id: "g5", title: "Peinado de novia", category: "peinado", type: "after",
      image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&q=80" },
    { id: "g6", title: "Keratina shine", category: "tratamiento", type: "after",
      image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&q=80" },
    { id: "g7", title: "Corte masculino fade", category: "corte", type: "after",
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80" },
    { id: "g8", title: "Mechas californianas", category: "color", type: "after",
      image: "https://images.unsplash.com/photo-1595499024481-56a0190bfb4a?w=600&q=80" },
    { id: "g9", title: "Brushing glamour", category: "peinado", type: "after",
      image: "https://images.unsplash.com/photo-1560869713-bf06b2bc7a9e?w=600&q=80" },
    { id: "g10", title: "Manicura semipermanente", category: "unas", type: "after",
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80" },
    { id: "g11", title: "Coloración rojiza", category: "color", type: "after",
      image: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=600&q=80" },
    { id: "g12", title: "Interior Studio Hair Palermo", category: "local", type: "space",
      image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&q=80" },
  ],

  // ----------------------------------------------------------
  // BLOG
  // ----------------------------------------------------------
  blog: [
    {
      id: "bl1",
      title: "Cómo cuidar el color de tu cabello en casa",
      slug: "cuidar-color-cabello-casa",
      excerpt: "Descubrí los secretos que usan los profesionales para que tu coloración dure más y se vea siempre brillante.",
      content: `Mantener el color del cabello vibrante y saludable entre visitas al salón requiere una rutina de cuidados específica. Aquí compartimos los consejos que usamos en Studio Hair.\n\n**1. Usá shampoo para cabello teñido**\nLos shampoos convencionales contienen sulfatos que desvanecen el color más rápido. Optá por productos específicos para cabellos con color o decolorados.\n\n**2. Hidratar es clave**\nEl color reseca el cabello. Usá una mascarilla hidratante 1-2 veces por semana. En Studio Hair recomendamos las de la línea Kérastase o Redken.\n\n**3. Agua fría para el enjuague final**\nUnos segundos de agua fría al final del lavado sellan las cutículas y mantienen el brillo del color por más tiempo.\n\n**4. Protección térmica siempre**\nAntes de usar plancha, rulero o secador, aplicá siempre protector térmico. El calor sin protección desvanece el color y daña la fibra capilar.\n\n**5. Alejate del sol sin protección**\nAsí como protegés tu piel, tu cabello también necesita protección UV. Existen sprays específicos para cabello con filtro solar.`,
      category: "Cuidados",
      author: "Valeria Romero",
      date: "2026-02-10",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
      tags: ["color", "cuidados", "tips"],
    },
    {
      id: "bl2",
      title: "Tendencias corte de pelo 2026: lo que viene fuerte",
      slug: "tendencias-corte-pelo-2026",
      excerpt: "Repasamos los cortes que están marcando tendencia este año y cuáles se adaptarán mejor a tu tipo de rostro.",
      content: `El 2026 llegó con propuestas audaces y otras clásicas reinventadas. Desde el bob estructura hasta el wolf cut, aquí un repaso de los estilos que dominan este año.\n\n**Bob estructura**\nEl bob de líneas geométricas y perfectamente estructurado sigue siendo rey. Favorece rostros ovalados y corazón.\n\n**Wolf cut**\nLa fusión entre shag y mullet que arrasó en 2024 sigue evolucionando. Ahora más depurado y con dégradé.\n\n**Curtain bangs**\nEl flequillo con apertura central sigue fortísimo. Ideal para suavizar rasgos en casi todos los tipos de rostro.\n\n**Buzz cut texturizado**\nEl corte muy corto pero con textura vuelve para los hombres. Bajo mantenimiento, alto impacto.\n\nEn Studio Hair podés consultar con nuestros estilistas cuál es el mejor corte para tu forma de cara, textura y estilo de vida.`,
      category: "Tendencias",
      author: "Martín Gómez",
      date: "2026-01-28",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80",
      tags: ["tendencias", "cortes", "2026"],
    },
    {
      id: "bl3",
      title: "¿Qué es la keratina y cuándo conviene hacérsela?",
      slug: "que-es-keratina-cuando-hacerla",
      excerpt: "Todo lo que necesitás saber sobre el tratamiento de keratina: desde cómo funciona hasta cuánto dura.",
      content: `La keratina es uno de los tratamientos más consultados en nuestro salón. Aquí respondemos las preguntas más frecuentes.\n\n**¿Qué es?**\nLa keratina es una proteína que forma parte de la estructura del cabello. El tratamiento de keratina repone esa proteína, aliviando el frizz y aportando brillo y suavidad que duran entre 3 y 6 meses.\n\n**¿Para qué tipo de cabello es ideal?**\nPara cabellos con frizz, secos, opacos o con ondas inmanejables. También funciona sobre cabellos teñidos o decolorados.\n\n**¿Cuánto dura el resultado?**\nDepende del tipo de cabello y del cuidado posterior, pero en general entre 3 y 5 meses.\n\n**Cuidados post-keratina**\n- Esperá 72 hs antes de lavar el cabello.\n- No lo atés ni uses accesorios durante esas primeras horas.\n- Usá shampoo sin sal (sodium chloride).\n- Evitá el agua de pileta (cloro) o usá protección.`,
      category: "Tratamientos",
      author: "Camila Torres",
      date: "2026-01-15",
      image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80",
      tags: ["keratina", "tratamiento", "alisado"],
    },
    {
      id: "bl4",
      title: "Cómo preparar tu cabello para una boda o evento",
      slug: "preparar-cabello-boda-evento",
      excerpt: "Si tenés un evento importante próximo, estos son los pasos que recomendamos para que tu peinado quede perfecto.",
      content: `La preparación ideal para el cabello antes de una boda u evento especial empieza semanas antes del gran día.\n\n**4 semanas antes**\nHacete un tratamiento de hidratación profunda o keratina. El cabello saludable toma mejor cualquier peinado.\n\n**2 semanas antes**\nCorte o retoque de puntas si es necesario. También es el momento ideal para una coloración si querés cambiar el tono.\n\n**3-4 días antes**\n¡No laves el cabello el día del evento! Un cabello con 1-2 días de lavado toma mejor los productos y dura más el peinado. Hacé un lavado especial hidratante.\n\n**El día del evento**\nLlegá al salón con el cabello limpio (pero no del mismo día). Traé fotos de referencia. Reservá con anticipación, especialmente para bodas.\n\nEn Studio Hair contamos con un paquete especial para novias y quinceañeras. Consultanos.`,
      category: "Consejos",
      author: "Camila Torres",
      date: "2026-02-01",
      image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
      tags: ["boda", "evento", "peinado"],
    },
    {
      id: "bl5",
      title: "Guía completa de barba: tipos, cuidados y estilos",
      slug: "guia-completa-barba-tipos-cuidados",
      excerpt: "Todo sobre el cuidado y mantenimiento de la barba: desde la hidratación hasta los mejores estilos según tu forma de cara.",
      content: `La barba es hoy un elemento clave del estilo masculino. Pero mantenerla en óptimas condiciones requiere dedicación y los productos correctos.\n\n**Tipos de barba más populares**\n- Barba corta de 3-5mm: fácil mantenimiento, muy versátil.\n- Barba de candado: define la mandíbula, ideal para rostros ovalados.\n- Barba larga natural: requiere más cuidado pero da carácter.\n- Barba candado o hipster: muy popular, estilizada y con diseño.\n\n**Cuidados esenciales**\n1. **Aceite de barba**: hidrata la piel y el vello. Aplicalo una vez por día.\n2. **Shampoo específico**: la barba necesita limpieza diferente a la del cabello.\n3. **Bálsamo o manteca**: para domar y dar forma.\n4. **Recorte regular**: cada 2-3 semanas para mantener el diseño limpio.\n\n**¿Cada cuánto ir al barbero?**\nPara mantener el diseño en óptimas condiciones, recomendamos una visita cada 2-3 semanas.`,
      category: "Barber",
      author: "Martín Gómez",
      date: "2026-02-18",
      image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
      tags: ["barba", "barber", "cuidados masculinos"],
    },
  ],

  // ----------------------------------------------------------
  // FAQ
  // ----------------------------------------------------------
  faq: [
    {
      q: "¿Cómo hago una reserva online?",
      a: "Hacé clic en 'Reservar turno' en el menú. Seguí los pasos: elegí sucursal, servicio, profesional (opcional), fecha y horario, y completá tus datos. Recibirás una confirmación por email al instante.",
    },
    {
      q: "¿Puedo cancelar o reprogramar mi turno?",
      a: "Sí. Te llegará un email de confirmación con un enlace para gestionar tu turno. Podés cancelar desde ese link hasta 2 horas antes del horario reservado.",
    },
    {
      q: "¿Con cuánta anticipación debo reservar?",
      a: "Lo ideal es reservar con 2-3 días de anticipación, especialmente para fines de semana y para servicios de larga duración como keratina o balayage. Aun así, si el día tiene disponibilidad, podés reservar el mismo día.",
    },
    {
      q: "¿Los precios del sitio son finales?",
      a: "Los precios indicados son 'desde'. El precio final puede variar según la longitud del cabello, el estado del mismo y la técnica específica que requiera. Nuestro equipo te informará el precio exacto antes de comenzar.",
    },
    {
      q: "¿Trabajan con todos los tipos de cabello?",
      a: "Sí. Nuestro equipo está capacitado para trabajar con todo tipo de cabellos: lisos, ondulados, rulos, afro, teñidos, decolorados y más.",
    },
    {
      q: "¿Puedo pagar con tarjeta?",
      a: "Aceptamos efectivo, tarjeta de débito y crédito (Visa, Mastercard, Naranja). También transferencia bancaria.",
    },
    {
      q: "¿Tienen servicio para eventos y novias?",
      a: "Sí. Ofrecemos paquetes especiales para novias, quinceañeras y eventos. Contactanos por el formulario de contacto o escribinos a hola@studiohair.com.ar para armar un presupuesto personalizado.",
    },
    {
      q: "¿Cuál es la política de no-show?",
      a: "Si no podés asistir, por favor cancelá tu turno con al menos 2 horas de anticipación para que otro cliente pueda tomar ese horario. Tres no-shows consecutivos pueden requerir seña para futuras reservas.",
    },
  ],

  // ----------------------------------------------------------
  // HELPERS - Categorías
  // ----------------------------------------------------------
  categories: [
    { id: "corte",      label: "Cortes",       icon: "✂️" },
    { id: "color",      label: "Color",        icon: "🎨" },
    { id: "barber",     label: "Barber",       icon: "🪒" },
    { id: "tratamiento",label: "Tratamientos", icon: "💆" },
    { id: "peinado",    label: "Peinados",     icon: "💁" },
    { id: "unas",       label: "Uñas",         icon: "💅" },
  ],
};

// ============================================================
// LocalStorage helpers
// ============================================================

const Store = {
  KEY: "sh_data",

  init() {
    if (!localStorage.getItem(this.KEY)) {
      const initial = {
        appointments: [
          {
            id: "apt1", branch_id: "b1", service_ids: ["s1"], staff_id: "p3",
            date: "2026-03-05", time: "10:00", duration: 60,
            status: "confirmado",
            customer: { name: "Laura García", email: "laura@email.com", phone: "1155667788" },
            notes: "", created_at: "2026-03-01T09:00:00",
          },
          {
            id: "apt2", branch_id: "b2", service_ids: ["s9"], staff_id: "p6",
            date: "2026-03-06", time: "15:00", duration: 70,
            status: "pendiente",
            customer: { name: "Carlos López", email: "carlos@email.com", phone: "1133445566" },
            notes: "", created_at: "2026-03-01T11:00:00",
          },
        ],
        customers: [
          {
            id: "c1", name: "Laura García", email: "laura@email.com",
            phone: "1155667788", notes: "Prefiere no usar calor excesivo",
            allergies: "", preferences: "Sin frizz, natural", created_at: "2026-01-10",
          },
          {
            id: "c2", name: "Carlos López", email: "carlos@email.com",
            phone: "1133445566", notes: "", allergies: "", preferences: "Barba prolija", created_at: "2026-02-05",
          },
        ],
        reviews_pending: [],
        admin_user: { email: "admin@studiohair.com.ar", password: "admin123" },
      };
      localStorage.setItem(this.KEY, JSON.stringify(initial));
    }
    return this;
  },

  get() {
    return JSON.parse(localStorage.getItem(this.KEY) || "{}");
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  getAppointments() { return this.get().appointments || []; },
  getCustomers()    { return this.get().customers || []; },

  addAppointment(apt) {
    const data = this.get();
    data.appointments = data.appointments || [];
    data.appointments.push(apt);
    this.save(data);
  },

  updateAppointment(id, changes) {
    const data = this.get();
    const idx = data.appointments.findIndex(a => a.id === id);
    if (idx !== -1) Object.assign(data.appointments[idx], changes);
    this.save(data);
  },

  deleteAppointment(id) {
    const data = this.get();
    data.appointments = (data.appointments || []).filter(a => a.id !== id);
    this.save(data);
  },

  addCustomer(customer) {
    const data = this.get();
    data.customers = data.customers || [];
    // Dedup by email
    if (!data.customers.find(c => c.email === customer.email)) {
      data.customers.push(customer);
      this.save(data);
    }
  },

  checkAdmin(email, password) {
    const data = this.get();
    const admin = data.admin_user || {};
    return admin.email === email && admin.password === password;
  },

  isAdminLoggedIn() {
    return sessionStorage.getItem("sh_admin") === "true";
  },

  adminLogin() { sessionStorage.setItem("sh_admin", "true"); },
  adminLogout() { sessionStorage.removeItem("sh_admin"); },
};

// ============================================================
// Utilidades generales
// ============================================================

const Utils = {
  formatPrice(p) {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(p);
  },

  formatDate(dateStr) {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  },

  generateId(prefix = "id") {
    return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  },

  renderStars(rating) {
    let s = "";
    for (let i = 1; i <= 5; i++) {
      s += `<span class="star ${i <= Math.round(rating) ? 'filled' : ''}">★</span>`;
    }
    return s;
  },

  getServiceById(id)  { return SH.services.find(s => s.id === id); },
  getStaffById(id)    { return SH.staff.find(s => s.id === id); },
  getBranchById(id)   { return SH.branches.find(b => b.id === id); },
  getCategoryLabel(id){ return (SH.categories.find(c => c.id === id) || {}).label || id; },

  getAvailableTimes(branchId, staffId, date, totalDuration) {
    const dateObj = new Date(date + "T12:00:00");
    const dow = dateObj.getDay(); // 0=dom, 6=sab
    if (dow === 0) return []; // domingo cerrado

    const startH = 9, endH = dow === 6 ? 19 : 20;
    const slots = [];
    const step = 30; // cada 30 min
    const appointments = Store.getAppointments();

    for (let h = startH * 60; h + totalDuration <= endH * 60; h += step) {
      const hh = String(Math.floor(h / 60)).padStart(2, "0");
      const mm = String(h % 60).padStart(2, "0");
      const time = `${hh}:${mm}`;

      // Verificar si no hay conflicto
      const conflict = appointments.some(apt => {
        if (apt.date !== date) return false;
        if (apt.branch_id !== branchId) return false;
        if (staffId && apt.staff_id !== staffId) return false;
        if (["cancelado"].includes(apt.status)) return false;
        const aptStart = apt.time.split(":").map(Number);
        const aptStartMin = aptStart[0] * 60 + aptStart[1];
        const aptDur = apt.duration || 60;
        return !(h + totalDuration <= aptStartMin || h >= aptStartMin + aptDur);
      });

      if (!conflict) slots.push(time);
    }
    return slots;
  },
};

// Init store on load
Store.init();
