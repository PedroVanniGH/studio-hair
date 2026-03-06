// prisma/seed.js
// Ejecutar con: node prisma/seed.js (después de npm install y configurar .env)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_AVAILABILITY = {
  "0": null,                                         // domingo cerrado
  "1": [{ from: "09:00", to: "20:00" }],             // lunes
  "2": [{ from: "09:00", to: "20:00" }],             // martes
  "3": [{ from: "09:00", to: "20:00" }],             // miércoles
  "4": [{ from: "09:00", to: "20:00" }],             // jueves
  "5": [{ from: "09:00", to: "20:00" }],             // viernes
  "6": [{ from: "09:00", to: "14:00" }],             // sábado
};

async function main() {
  console.log('🌱 Iniciando seed...');

  // ─── Admin ───────────────────────────────────────────────────────────────────
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@studiohair.com.ar';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme-123!';
  const passwordHash  = await bcrypt.hash(adminPassword, 12);

  await prisma.admin.upsert({
    where:  { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });
  console.log('✓ Admin creado:', adminEmail);

  // ─── Sucursales ───────────────────────────────────────────────────────────────
  const palermo = await prisma.branch.upsert({
    where:  { slug: 'palermo' },
    update: {},
    create: {
      slug:    'palermo',
      name:    'Studio Hair Palermo',
      address: 'Thames 1650, Palermo, Buenos Aires',
      phone:   '+54 11 4567-8900',
      email:   'palermo@studiohair.com.ar',
      imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80',
      hours:   { "0": null, "1": "09:00–20:00", "2": "09:00–20:00", "3": "09:00–20:00", "4": "09:00–20:00", "5": "09:00–21:00", "6": "09:00–19:00" },
    },
  });

  const villaCrespo = await prisma.branch.upsert({
    where:  { slug: 'villa-crespo' },
    update: {},
    create: {
      slug:    'villa-crespo',
      name:    'Studio Hair Villa Crespo',
      address: 'Av. Corrientes 4820, Villa Crespo, Buenos Aires',
      phone:   '+54 11 4891-2233',
      email:   'villacrespo@studiohair.com.ar',
      imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
      hours:   { "0": null, "1": "09:00–20:00", "2": "09:00–20:00", "3": "09:00–20:00", "4": "09:00–20:00", "5": "09:00–20:00", "6": "10:00–18:00" },
    },
  });
  console.log('✓ Sucursales creadas');

  // ─── Servicios ────────────────────────────────────────────────────────────────
  const servicesData = [
    { slug:'corte-mujer',   name:'Corte de cabello mujer',     category:'corte',       durationMin:60,  bufferMin:10, price:5500,  popular:true,  imageUrl:'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80' },
    { slug:'corte-hombre',  name:'Corte de cabello hombre',    category:'corte',       durationMin:45,  bufferMin:10, price:3800,  popular:true,  imageUrl:'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80' },
    { slug:'corte-infantil',name:'Corte infantil (hasta 12)',  category:'corte',       durationMin:30,  bufferMin:10, price:2800,  popular:false, imageUrl:'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=600&q=80' },
    { slug:'coloracion',    name:'Coloración completa',        category:'color',       durationMin:120, bufferMin:15, price:9500,  popular:true,  imageUrl:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80' },
    { slug:'balayage',      name:'Balayage / Mechas californianas', category:'color',  durationMin:180, bufferMin:15, price:15000, popular:true,  imageUrl:'https://images.unsplash.com/photo-1595499024481-56a0190bfb4a?w=600&q=80' },
    { slug:'retoque-raiz',  name:'Retoque de raíz',            category:'color',       durationMin:90,  bufferMin:15, price:6500,  popular:false, imageUrl:'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=600&q=80' },
    { slug:'decoloracion',  name:'Decoloración + color fantasía', category:'color',    durationMin:210, bufferMin:15, price:18000, popular:false, imageUrl:'https://images.unsplash.com/photo-1598524374912-f895b7a5f61d?w=600&q=80' },
    { slug:'arreglo-barba', name:'Arreglo de barba',           category:'barber',      durationMin:30,  bufferMin:10, price:2500,  popular:true,  imageUrl:'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80' },
    { slug:'combo-barber',  name:'Corte + barba (combo)',      category:'barber',      durationMin:70,  bufferMin:10, price:5800,  popular:true,  imageUrl:'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80' },
    { slug:'keratina',      name:'Keratina brasilera',         category:'tratamiento', durationMin:180, bufferMin:20, price:22000, popular:true,  imageUrl:'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&q=80' },
    { slug:'hidratacion',   name:'Hidratación profunda',       category:'tratamiento', durationMin:60,  bufferMin:10, price:5500,  popular:false, imageUrl:'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80' },
    { slug:'botox-capilar', name:'Botox capilar',              category:'tratamiento', durationMin:120, bufferMin:15, price:14000, popular:false, imageUrl:'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80' },
    { slug:'peinado-evento',name:'Peinado de evento',          category:'peinado',     durationMin:90,  bufferMin:15, price:8500,  popular:false, imageUrl:'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&q=80' },
    { slug:'brushing',      name:'Brushing + styling',         category:'peinado',     durationMin:45,  bufferMin:10, price:4200,  popular:false, imageUrl:'https://images.unsplash.com/photo-1560869713-bf06b2bc7a9e?w=600&q=80' },
    { slug:'manicura',      name:'Manicura semipermanente',    category:'unas',        durationMin:60,  bufferMin:10, price:4500,  popular:false, imageUrl:'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80' },
  ];

  const createdServices = {};
  for (const s of servicesData) {
    const svc = await prisma.service.upsert({
      where:  { slug: s.slug },
      update: {},
      create: s,
    });
    createdServices[s.slug] = svc;
  }
  console.log('✓ Servicios creados:', Object.keys(createdServices).length);

  // ─── Peluqueros ───────────────────────────────────────────────────────────────
  const professionalsData = [
    {
      name: 'Valeria Romero', role: 'Directora técnica & Colorista senior',
      bio:  'Con más de 12 años de experiencia, Valeria es especialista en coloración avanzada y técnicas de balayage. Formada en Buenos Aires y Madrid.',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
      branchId: palermo.id, instagram: '@vale_studiohair', rating: 4.9, reviewCount: 148,
      serviceSlugs: ['coloracion','balayage','retoque-raiz','decoloracion','keratina','hidratacion','botox-capilar'],
      availability: DEFAULT_AVAILABILITY,
    },
    {
      name: 'Martín Gómez', role: 'Barber & Estilista',
      bio:  'Martín fusiona técnicas de barbería clásica con tendencias urbanas actuales. Especialista en fades y diseños creativos.',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      branchId: palermo.id, instagram: '@martin_barber', rating: 4.8, reviewCount: 203,
      serviceSlugs: ['corte-hombre','arreglo-barba','combo-barber','corte-mujer'],
      availability: DEFAULT_AVAILABILITY,
    },
    {
      name: 'Camila Torres', role: 'Estilista & Peinadora',
      bio:  'Camila es experta en peinados de novia y eventos. Su pasión por los detalles la distingue en cada look que crea.',
      photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      branchId: palermo.id, instagram: '@cami_hair', rating: 4.9, reviewCount: 87,
      serviceSlugs: ['corte-mujer','peinado-evento','brushing','hidratacion'],
      availability: DEFAULT_AVAILABILITY,
    },
    {
      name: 'Diego Fernández', role: 'Colorista & Técnico',
      bio:  'Diego se especializa en coloraciones fantasía y técnicas de decoloración segura. Fanático de los colores vibrantes.',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      branchId: palermo.id, instagram: '@diego_color', rating: 4.7, reviewCount: 95,
      serviceSlugs: ['coloracion','balayage','retoque-raiz','decoloracion','botox-capilar'],
      availability: DEFAULT_AVAILABILITY,
    },
    {
      name: 'Luciana Paz', role: 'Estilista senior',
      bio:  'Luciana tiene un ojo especial para los cortes que favorecen cada tipo de rostro. 8 años transformando looks.',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      branchId: villaCrespo.id, instagram: '@luci_paz_hair', rating: 4.8, reviewCount: 112,
      serviceSlugs: ['corte-mujer','corte-infantil','keratina','hidratacion','botox-capilar','brushing'],
      availability: DEFAULT_AVAILABILITY,
    },
    {
      name: 'Rodrigo Blanco', role: 'Barber',
      bio:  'Rodrigo es el rey de la navaja recta. Especialista en cortes masculinos clásicos y modernos en Villa Crespo.',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
      branchId: villaCrespo.id, instagram: '@rodrigo_barber', rating: 4.9, reviewCount: 178,
      serviceSlugs: ['corte-hombre','arreglo-barba','combo-barber'],
      availability: DEFAULT_AVAILABILITY,
    },
    {
      name: 'Sofía Mendez', role: 'Colorista & Nail Artist',
      bio:  'Sofía combina su talento en coloración con el arte de las uñas. Cada detalle importa.',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      branchId: villaCrespo.id, instagram: '@sofi_nails_hair', rating: 4.7, reviewCount: 64,
      serviceSlugs: ['coloracion','retoque-raiz','hidratacion','manicura'],
      availability: DEFAULT_AVAILABILITY,
    },
    {
      name: 'Facundo Ríos', role: 'Estilista & Colorista',
      bio:  'Facundo tiene pasión por los cambios de look radicales. Especialista en balayage y keratina.',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      branchId: villaCrespo.id, instagram: '@facu_haircraft', rating: 4.8, reviewCount: 91,
      serviceSlugs: ['corte-mujer','corte-hombre','balayage','keratina','botox-capilar','brushing'],
      availability: DEFAULT_AVAILABILITY,
    },
  ];

  for (const p of professionalsData) {
    const { serviceSlugs, ...profData } = p;
    const serviceIds = serviceSlugs.map(slug => createdServices[slug]?.id).filter(Boolean);

    // Evitar duplicados por nombre + sucursal
    const existing = await prisma.professional.findFirst({
      where: { name: profData.name, branchId: profData.branchId },
    });

    if (!existing) {
      await prisma.professional.create({
        data: {
          ...profData,
          services: { create: serviceIds.map(id => ({ serviceId: id })) },
        },
      });
    }
  }
  console.log('✓ Profesionales creados');
  console.log('\n✅ Seed completado exitosamente!');
  console.log(`\n   Admin: ${adminEmail} / ${adminPassword}`);
  console.log('   ⚠️  Cambiá la contraseña del admin en producción!\n');
}

main()
  .catch(err => { console.error('❌ Error en seed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
