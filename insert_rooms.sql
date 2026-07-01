-- Crear nuevas organizaciones
INSERT INTO organizations (id, name, slug, owner_id, subscription_status, subscription_plan, is_active) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'Fox in a Box Madrid', 'fox-in-a-box-madrid', '305892d1-6e8e-4f2d-b34f-5229c08034af', 'active', 'professional', true),
  ('a1b2c3d4-e5f6-7890-abcd-222222222222', 'Parapark Barcelona', 'parapark-barcelona', '305892d1-6e8e-4f2d-b34f-5229c08034af', 'active', 'professional', true),
  ('a1b2c3d4-e5f6-7890-abcd-333333333333', 'Exit Madrid', 'exit-madrid', '305892d1-6e8e-4f2d-b34f-5229c08034af', 'active', 'professional', true),
  ('a1b2c3d4-e5f6-7890-abcd-444444444444', 'Escape College Sevilla', 'escape-college-sevilla', '305892d1-6e8e-4f2d-b34f-5229c08034af', 'active', 'professional', true),
  ('a1b2c3d4-e5f6-7890-abcd-555555555555', 'Lock-Clock Barcelona', 'lock-clock-barcelona', '305892d1-6e8e-4f2d-b34f-5229c08034af', 'active', 'professional', true),
  ('a1b2c3d4-e5f6-7890-abcd-666666666666', 'Enigma Rooms Valencia', 'enigma-rooms-valencia', '305892d1-6e8e-4f2d-b34f-5229c08034af', 'active', 'professional', true),
  ('a1b2c3d4-e5f6-7890-abcd-777777777777', 'Cronology Escape Madrid', 'cronology-escape', '305892d1-6e8e-4f2d-b34f-5229c08034af', 'active', 'professional', true),
  ('a1b2c3d4-e5f6-7890-abcd-888888888888', 'The Rombo Code Bilbao', 'the-rombo-code-bilbao', '305892d1-6e8e-4f2d-b34f-5229c08034af', 'active', 'professional', true),
  ('a1b2c3d4-e5f6-7890-abcd-999999999999', 'Cube Room Zaragoza', 'cube-room-zaragoza', '305892d1-6e8e-4f2d-b34f-5229c08034af', 'active', 'professional', true),
  ('a1b2c3d4-e5f6-7890-abcd-aaaaaaaaaaaa', 'Mastermind Malaga', 'mastermind-malaga', '305892d1-6e8e-4f2d-b34f-5229c08034af', 'active', 'professional', true)
ON CONFLICT DO NOTHING;

-- Insertar 20 salas de escape rooms reales
INSERT INTO rooms (
  id, organization_id, name, description, capacity, duration_minutes, price_per_person,
  image_url, is_active, capacity_min, difficulty_level, theme, color, booking_manager,
  min_age, max_age, physical_rating, fear_level, city, province, address,
  google_rating, tripadvisor_rating, community, latitude, longitude,
  slogan, synopsis, key_features, with_actors, with_fathers, with_monitor,
  themes, average_rating, total_reviews, is_family_friendly, verification_status
) VALUES
-- 1. Fox in a Box Madrid - Bunker
(
  'b0000001-0000-0000-0000-000000000001',
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'El Bunker',
  'Estamos en 1945. La guerra está a punto de terminar, pero los aliados han interceptado un mensaje cifrado que indica la existencia de un búnker secreto nazi con armas biológicas. Tu equipo de espías ha sido enviado para infiltrarse, encontrar las armas y desactivarlas antes de que sean lanzadas. Tienes 60 minutos.',
  6, 60, 15.00,
  'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800',
  true, 2, 4, 'Aventura', '#4A5568', 'manual',
  14, 99, 'Medio', 'Medio', 'Madrid', 'Madrid', 'Calle de Atocha 36, 28012 Madrid',
  '4.8', '5.0', 'Comunidad de Madrid', '40.4115', '-3.6989',
  'La historia no siempre la cuentan los ganadores',
  'Infiltra el búnker nazi y desactiva las armas biológicas antes de que sea demasiado tarde.',
  'Decorados cinematográficos, efectos de sonido inmersivos, candados mecánicos y electrónicos',
  false, false, false,
  ARRAY['aventura', 'historia', 'espionaje']::varchar[],
  4.8, 342, false, 'verified'
),
-- 2. Fox in a Box Madrid - Laboratorio Zombie
(
  'b0000001-0000-0000-0000-000000000002',
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'Laboratorio Zombie',
  'Un virus mortal ha sido liberado en un laboratorio. Tu equipo de científicos debe encontrar el antídoto antes de que el virus se propague por toda la ciudad. Pero cuidado, no estáis solos en el laboratorio... los infectados merodean por los pasillos.',
  5, 60, 18.00,
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
  true, 2, 4, 'Terror', '#E53E3E', 'manual',
  16, 99, 'Alto', 'Alto', 'Madrid', 'Madrid', 'Calle de Atocha 36, 28012 Madrid',
  '4.9', '5.0', 'Comunidad de Madrid', '40.4115', '-3.6989',
  'El virus ya está aquí. El tiempo se agota.',
  'Encuentra el antídoto en un laboratorio infestado de zombis antes de convertirte en uno de ellos.',
  'Actores en vivo, efectos especiales, escenografía de laboratorio hiperrealista',
  true, false, false,
  ARRAY['terror', 'zombies', 'ciencia']::varchar[],
  4.9, 567, false, 'verified'
),
-- 3. Parapark Barcelona - La Cripta de los Templarios
(
  'b0000001-0000-0000-0000-000000000003',
  'a1b2c3d4-e5f6-7890-abcd-222222222222',
  'La Cripta de los Templarios',
  'Bajo las calles del Barrio Gótico de Barcelona se esconde una cripta templaria olvidada durante siglos. Una serie de pistas han llevado a tu equipo de arqueólogos hasta este lugar. Descifra los enigmas de los caballeros templarios y encuentra el tesoro sagrado antes de que la cripta se selle para siempre.',
  5, 60, 16.00,
  'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800',
  true, 2, 4, 'Misterio', '#D69E2E', 'manual',
  12, 99, 'Bajo', 'Bajo', 'Barcelona', 'Barcelona', 'Carrer de Ferran 23, 08002 Barcelona',
  '4.7', '4.5', 'Cataluña', '41.3818', '2.1748',
  'Los secretos templarios esperan ser descubiertos',
  'Explora una cripta templaria bajo el Barrio Gótico y descifra enigmas medievales.',
  'Ambientación medieval auténtica, puzzles de lógica, mecanismos ocultos',
  false, true, false,
  ARRAY['misterio', 'historia', 'templarios']::varchar[],
  4.7, 289, true, 'verified'
),
-- 4. Parapark Barcelona - Psiquiátrico
(
  'b0000001-0000-0000-0000-000000000004',
  'a1b2c3d4-e5f6-7890-abcd-222222222222',
  'El Psiquiátrico Abandonado',
  'El antiguo Hospital Psiquiátrico de Santa María cerró sus puertas en 1978 tras una serie de sucesos inexplicables. Ahora, 45 años después, un equipo de investigadores paranormales entra para documentar los hechos. Las puertas se cierran detrás de vosotros. No estáis solos.',
  4, 60, 20.00,
  'https://images.unsplash.com/photo-1509248961085-879c25c4245b?w=800',
  true, 2, 5, 'Terror', '#742A2A', 'manual',
  16, 99, 'Alto', 'Alto', 'Barcelona', 'Barcelona', 'Carrer de Ferran 23, 08002 Barcelona',
  '4.9', '5.0', 'Cataluña', '41.3818', '2.1748',
  'Hay cosas peores que la locura...',
  'Investiga un psiquiátrico abandonado donde los pacientes nunca se fueron realmente.',
  'Actor en vivo, efectos de terror sensoriales, puzzles psicológicos, oscuridad',
  true, false, false,
  ARRAY['terror', 'paranormal', 'psicologico']::varchar[],
  4.9, 412, false, 'verified'
),
-- 5. Exit Madrid - Misión Imposible
(
  'b0000001-0000-0000-0000-000000000005',
  'a1b2c3d4-e5f6-7890-abcd-333333333333',
  'Misión Imposible: Protocolo Espía',
  'La agencia de inteligencia te ha reclutado para una misión de alto secreto. Debes infiltrarte en la embajada enemiga, hackear su sistema de seguridad y robar los documentos clasificados que revelan una conspiración internacional. Tu equipo tiene 60 minutos antes de que cambien los turnos de guardia.',
  6, 60, 14.00,
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
  true, 2, 3, 'Aventura', '#2B6CB0', 'manual',
  12, 99, 'Medio', 'Bajo', 'Madrid', 'Madrid', 'Gran Vía 42, 28013 Madrid',
  '4.6', '4.5', 'Comunidad de Madrid', '40.4207', '-3.7068',
  'Tu misión, si decides aceptarla...',
  'Hackea sistemas de seguridad y roba documentos clasificados en una embajada.',
  'Tecnología avanzada, láseres, cámaras de seguridad, puzzles electrónicos',
  false, true, false,
  ARRAY['aventura', 'espionaje', 'tecnologia']::varchar[],
  4.6, 198, true, 'verified'
),
-- 6. Exit Madrid - La Tumba del Faraón
(
  'b0000001-0000-0000-0000-000000000006',
  'a1b2c3d4-e5f6-7890-abcd-333333333333',
  'La Tumba del Faraón',
  'En 1922, Howard Carter descubrió la tumba de Tutankamón. Lo que no contó es que encontró una cámara secreta con una maldición que sellaría la tumba para siempre. Tu equipo de arqueólogos ha encontrado la entrada a esta cámara. Resuelve los enigmas del antiguo Egipto y escapa antes de quedar atrapado eternamente.',
  5, 75, 17.00,
  'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800',
  true, 2, 3, 'Aventura', '#C05621', 'manual',
  10, 99, 'Bajo', 'Bajo', 'Madrid', 'Madrid', 'Gran Vía 42, 28013 Madrid',
  '4.7', '4.5', 'Comunidad de Madrid', '40.4207', '-3.7068',
  'La maldición del faraón te espera',
  'Explora la cámara secreta de Tutankamón y escapa antes de que la maldición te atrape.',
  'Escenografía egipcia detallada, trampas mecánicas, jeroglíficos, efectos de arena',
  false, true, false,
  ARRAY['aventura', 'historia', 'egipto']::varchar[],
  4.7, 256, true, 'verified'
),
-- 7. Escape College Sevilla - El Caso del Detective
(
  'b0000001-0000-0000-0000-000000000007',
  'a1b2c3d4-e5f6-7890-abcd-444444444444',
  'El Caso del Detective',
  'El famoso detective Alejandro Blackwood ha desaparecido mientras investigaba una serie de crímenes. Su despacho guarda las pistas para descubrir al culpable. Ponte en la piel del detective, examina las pruebas y resuelve el caso antes de que el asesino vuelva a actuar.',
  6, 60, 13.00,
  'https://images.unsplash.com/photo-1587613981449-44f84a92a5d9?w=800',
  true, 2, 3, 'Misterio', '#553C9A', 'manual',
  12, 99, 'Bajo', 'Bajo', 'Sevilla', 'Sevilla', 'Calle Sierpes 18, 41004 Sevilla',
  '4.5', '4.5', 'Andalucía', '37.3891', '-5.9845',
  'El crimen perfecto no existe',
  'Investiga la desaparición del detective Blackwood y resuelve el caso.',
  'Despacho de detective vintage, pistas forenses, puzzles deductivos',
  false, true, false,
  ARRAY['misterio', 'detective', 'crimen']::varchar[],
  4.5, 167, true, 'verified'
),
-- 8. Escape College Sevilla - La Inquisición
(
  'b0000001-0000-0000-0000-000000000008',
  'a1b2c3d4-e5f6-7890-abcd-444444444444',
  'La Inquisición Española',
  'Sevilla, 1481. La Inquisición os ha declarado herejes y os ha encerrado en los calabozos del tribunal. El inquisidor general ha salido y tenéis una hora para escapar antes de que vuelva y dicte sentencia. Encontrad la forma de romper vuestras cadenas y salir con vida de esta pesadilla medieval.',
  5, 60, 15.00,
  'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=800',
  true, 2, 4, 'Historia', '#744210', 'manual',
  14, 99, 'Medio', 'Medio', 'Sevilla', 'Sevilla', 'Calle Sierpes 18, 41004 Sevilla',
  '4.8', '5.0', 'Andalucía', '37.3891', '-5.9845',
  'Escapar o arder en la hoguera',
  'Escapa de los calabozos de la Inquisición española antes de que el inquisidor regrese.',
  'Calabozo medieval auténtico, cadenas, mecanismos de época, ambientación histórica',
  false, false, false,
  ARRAY['historia', 'medieval', 'thriller']::varchar[],
  4.8, 234, false, 'verified'
),
-- 9. Lock-Clock Barcelona - El Taller de Da Vinci
(
  'b0000001-0000-0000-0000-000000000009',
  'a1b2c3d4-e5f6-7890-abcd-555555555555',
  'El Taller de Leonardo Da Vinci',
  'Habéis encontrado el taller secreto de Leonardo Da Vinci en Florencia. Entre sus inventos y manuscritos se esconde el plano de su máquina más ambiciosa: un dispositivo capaz de cambiar el curso de la historia. Descifrad sus códigos y ensamblar la máquina antes de que los enemigos del maestro os encuentren.',
  6, 60, 16.00,
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
  true, 2, 3, 'Aventura', '#B7791F', 'manual',
  10, 99, 'Bajo', 'Bajo', 'Barcelona', 'Barcelona', 'Carrer de la Boqueria 21, 08002 Barcelona',
  '4.8', '5.0', 'Cataluña', '41.3809', '2.1729',
  'El genio del Renacimiento te necesita',
  'Descifra los códigos de Leonardo Da Vinci y ensambla su invento más ambicioso.',
  'Réplicas de inventos de Da Vinci, puzzles mecánicos, decoración renacentista',
  false, true, false,
  ARRAY['aventura', 'historia', 'arte']::varchar[],
  4.8, 378, true, 'verified'
),
-- 10. Lock-Clock Barcelona - Naufragio
(
  'b0000001-0000-0000-0000-000000000010',
  'a1b2c3d4-e5f6-7890-abcd-555555555555',
  'Naufragio: La Isla Perdida',
  'Vuestro barco ha naufragado cerca de una isla misteriosa. Al explorarla, descubrís los restos de una civilización perdida y un terrible secreto: la isla se está hundiendo. Usad los conocimientos de la antigua civilización para construir una balsa y escapar antes de que la isla desaparezca bajo las aguas.',
  6, 70, 18.00,
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  true, 2, 4, 'Aventura', '#2F855A', 'manual',
  10, 99, 'Medio', 'Bajo', 'Barcelona', 'Barcelona', 'Carrer de la Boqueria 21, 08002 Barcelona',
  '4.6', '4.5', 'Cataluña', '41.3809', '2.1729',
  'La isla se hunde. El reloj corre.',
  'Explora una isla perdida y construye una balsa antes de que se hunda bajo el mar.',
  'Decoración tropical inmersiva, efectos de agua, puzzles de supervivencia',
  false, true, false,
  ARRAY['aventura', 'exploracion', 'naturaleza']::varchar[],
  4.6, 201, true, 'verified'
),
-- 11. Enigma Rooms Valencia - Chernóbil
(
  'b0000001-0000-0000-0000-000000000011',
  'a1b2c3d4-e5f6-7890-abcd-666666666666',
  'Chernóbil: Zona de Exclusión',
  'Año 2024. Una señal de radio de emergencia ha sido detectada desde la zona de exclusión de Chernóbil. Tu equipo de la OIEA ha sido enviado a investigar. Al llegar al reactor 4, descubrís que alguien ha manipulado los sistemas de contención. Debéis estabilizar el reactor antes de que ocurra un segundo desastre nuclear.',
  5, 60, 19.00,
  'https://images.unsplash.com/photo-1597655601841-214a4cfe8b2c?w=800',
  true, 2, 5, 'Ciencia ficción', '#276749', 'manual',
  16, 99, 'Alto', 'Alto', 'Valencia', 'Valencia', 'Calle Colón 15, 46004 Valencia',
  '4.9', '5.0', 'Comunidad Valenciana', '39.4699', '-0.3763',
  'El contador Geiger no miente',
  'Estabiliza el reactor 4 de Chernóbil antes de que ocurra un nuevo desastre nuclear.',
  'Efectos de radiación, sonidos industriales, tecnología soviética, puzzles técnicos',
  false, false, false,
  ARRAY['ciencia ficcion', 'thriller', 'nuclear']::varchar[],
  4.9, 445, false, 'verified'
),
-- 12. Enigma Rooms Valencia - El Circo Maldito
(
  'b0000001-0000-0000-0000-000000000012',
  'a1b2c3d4-e5f6-7890-abcd-666666666666',
  'El Circo Maldito',
  'El Gran Circo Fantástico llegó a Valencia en 1923 y nunca se fue. Los artistas desaparecieron misteriosamente después de la última función. Ahora, décadas después, las luces del circo se han encendido solas. Entrad en la carpa y descubrid qué ocurrió aquella noche. Pero cuidado, el payaso maestro de ceremonias sigue buscando público.',
  5, 60, 17.00,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  true, 2, 4, 'Terror', '#E53E3E', 'manual',
  16, 99, 'Medio', 'Alto', 'Valencia', 'Valencia', 'Calle Colón 15, 46004 Valencia',
  '4.7', '4.5', 'Comunidad Valenciana', '39.4699', '-0.3763',
  'El espectáculo debe continuar... para siempre',
  'Descubre el misterio del circo abandonado mientras el payaso te acecha entre las sombras.',
  'Ambientación circense de terror, actor payaso en vivo, ilusiones ópticas, sonidos perturbadores',
  true, false, false,
  ARRAY['terror', 'payasos', 'misterio']::varchar[],
  4.7, 312, false, 'verified'
),
-- 13. Cronology Madrid - Viaje en el Tiempo
(
  'b0000001-0000-0000-0000-000000000013',
  'a1b2c3d4-e5f6-7890-abcd-777777777777',
  'Viaje en el Tiempo',
  'El profesor Cronos ha construido una máquina del tiempo pero algo ha salido mal. Las líneas temporales se están mezclando y la realidad se desintegra. Debéis viajar por diferentes épocas, desde la prehistoria hasta el futuro, recogiendo fragmentos del tiempo para reparar el continuo espacio-temporal.',
  6, 75, 20.00,
  'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800',
  true, 2, 4, 'Ciencia ficción', '#3182CE', 'manual',
  10, 99, 'Medio', 'Bajo', 'Madrid', 'Madrid', 'Calle de Fuencarral 88, 28004 Madrid',
  '4.8', '5.0', 'Comunidad de Madrid', '40.4266', '-3.7005',
  'Todas las épocas. Una sola oportunidad.',
  'Viaja por diferentes épocas históricas para reparar las líneas temporales rotas.',
  'Múltiples salas temáticas, efectos de teletransporte, tecnología interactiva, decorados de época',
  false, true, false,
  ARRAY['ciencia ficcion', 'viaje temporal', 'aventura']::varchar[],
  4.8, 523, true, 'verified'
),
-- 14. Cronology Madrid - La Casa Encantada
(
  'b0000001-0000-0000-0000-000000000014',
  'a1b2c3d4-e5f6-7890-abcd-777777777777',
  'La Casa Encantada de la Condesa',
  'La mansión de la Condesa de Montenegro lleva abandonada desde 1890. Los vecinos cuentan historias de luces que se encienden solas y gritos en la noche. Un equipo de documentalistas ha desaparecido mientras grababa un reportaje. Entrad para rescatarlos... si podéis.',
  4, 60, 22.00,
  'https://images.unsplash.com/photo-1520013817300-1f4c1cb245ef?w=800',
  true, 2, 5, 'Terror', '#1A202C', 'manual',
  18, 99, 'Alto', 'Alto', 'Madrid', 'Madrid', 'Calle de Fuencarral 88, 28004 Madrid',
  '5.0', '5.0', 'Comunidad de Madrid', '40.4266', '-3.7005',
  'Ella nunca dejó su casa. Y ahora tú tampoco podrás.',
  'Rescata al equipo desaparecido de la mansión de la Condesa, si consigues mantener la cordura.',
  'Máximo terror, 2 actores en vivo, efectos especiales cinematográficos, sustos sensoriales',
  true, false, false,
  ARRAY['terror', 'paranormal', 'mansion']::varchar[],
  5.0, 678, false, 'verified'
),
-- 15. The Rombo Code Bilbao - Operación Picasso
(
  'b0000001-0000-0000-0000-000000000015',
  'a1b2c3d4-e5f6-7890-abcd-888888888888',
  'Operación Picasso',
  'El Museo Guggenheim de Bilbao guarda un secreto: una de las obras de Picasso contiene un mapa codificado hacia el mayor tesoro artístico robado durante la Guerra Civil. Tu equipo debe infiltrarse en la sala secreta del museo, descifrar el código de Picasso y localizar el tesoro antes de que caiga en manos equivocadas.',
  5, 60, 16.00,
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
  true, 2, 3, 'Aventura', '#DD6B20', 'manual',
  12, 99, 'Bajo', 'Bajo', 'Bilbao', 'Vizcaya', 'Gran Vía Don Diego López de Haro 25, 48009 Bilbao',
  '4.6', '4.5', 'País Vasco', '43.2630', '-2.9350',
  'El arte esconde más de lo que muestra',
  'Descifra el código oculto en una obra de Picasso para encontrar un tesoro perdido.',
  'Réplicas artísticas, puzzles visuales, sala de museo inmersiva, tecnología UV',
  false, true, false,
  ARRAY['aventura', 'arte', 'espionaje']::varchar[],
  4.6, 189, true, 'verified'
),
-- 16. The Rombo Code Bilbao - La Mina Perdida
(
  'b0000001-0000-0000-0000-000000000016',
  'a1b2c3d4-e5f6-7890-abcd-888888888888',
  'La Mina Perdida del Norte',
  'En las montañas de Vizcaya existe una antigua mina de hierro que fue clausurada después de que todos los mineros desaparecieran en 1912. Vuestro equipo de espeleólogos ha encontrado la entrada. En el interior, además de los restos de la mina, encontraréis algo que no debería existir.',
  5, 60, 15.00,
  'https://images.unsplash.com/photo-1633934542430-0905ccb5f050?w=800',
  true, 2, 4, 'Aventura', '#4A3728', 'manual',
  14, 99, 'Alto', 'Medio', 'Bilbao', 'Vizcaya', 'Gran Vía Don Diego López de Haro 25, 48009 Bilbao',
  '4.7', '4.5', 'País Vasco', '43.2630', '-2.9350',
  'En la oscuridad de la mina, algo espera',
  'Explora una mina abandonada del siglo XX y descubre qué causó la desaparición de los mineros.',
  'Ambientación subterránea, túneles, efectos de derrumbe, puzzles de minería',
  false, false, false,
  ARRAY['aventura', 'exploracion', 'misterio']::varchar[],
  4.7, 167, false, 'verified'
),
-- 17. Cube Room Zaragoza - El Alquimista
(
  'b0000001-0000-0000-0000-000000000017',
  'a1b2c3d4-e5f6-7890-abcd-999999999999',
  'El Laboratorio del Alquimista',
  'En los sótanos de la Universidad de Zaragoza se ha descubierto el laboratorio secreto de un alquimista medieval. Sus notas hablan de la piedra filosofal y de un elixir de la vida eterna. Pero el laboratorio está protegido por trampas y enigmas. Descubrid la fórmula antes de que el laboratorio se autodestruya.',
  5, 60, 14.00,
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800',
  true, 2, 3, 'Misterio', '#6B46C1', 'manual',
  10, 99, 'Bajo', 'Bajo', 'Zaragoza', 'Zaragoza', 'Calle Alfonso I 32, 50003 Zaragoza',
  '4.5', '4.5', 'Aragón', '41.6560', '-0.8773',
  'La fórmula de la eternidad existe. Encuéntrala.',
  'Descubre la fórmula del alquimista medieval antes de que el laboratorio se autodestruya.',
  'Laboratorio alquímico, pociones, puzzles químicos, mecanismos antiguos',
  false, true, false,
  ARRAY['misterio', 'ciencia', 'medieval']::varchar[],
  4.5, 134, true, 'verified'
),
-- 18. Cube Room Zaragoza - Atraco al Banco
(
  'b0000001-0000-0000-0000-000000000018',
  'a1b2c3d4-e5f6-7890-abcd-999999999999',
  'Atraco al Banco Central',
  'Inspirado en los grandes golpes de la historia. Tu equipo de ladrones profesionales ha planeado durante meses el atraco perfecto al Banco Central. Entráis por un túnel subterráneo, pero una alarma silenciosa se ha activado. Tenéis 60 minutos para abrir la caja fuerte, coger el botín y escapar antes de que llegue la policía.',
  6, 60, 15.00,
  'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800',
  true, 2, 3, 'Aventura', '#2D3748', 'manual',
  12, 99, 'Medio', 'Bajo', 'Zaragoza', 'Zaragoza', 'Calle Alfonso I 32, 50003 Zaragoza',
  '4.6', '4.5', 'Aragón', '41.6560', '-0.8773',
  'El golpe del siglo en 60 minutos',
  'Ejecuta el atraco perfecto al Banco Central antes de que llegue la policía.',
  'Réplica de bóveda bancaria, láser de seguridad, caja fuerte real, túnel de escape',
  false, true, false,
  ARRAY['aventura', 'crimen', 'atraco']::varchar[],
  4.6, 223, true, 'verified'
),
-- 19. Mastermind Málaga - Piratas del Mediterráneo
(
  'b0000001-0000-0000-0000-000000000019',
  'a1b2c3d4-e5f6-7890-abcd-aaaaaaaaaaaa',
  'Piratas del Mediterráneo',
  'En el puerto de Málaga, en 1704, el infame pirata Barbanegra del Sur escondió su tesoro en las cuevas de la costa antes de ser capturado. Su mapa del tesoro ha sido descubierto y debéis seguir las pistas a través de su antiguo barco varado para encontrar el cofre antes de que suba la marea.',
  6, 60, 13.00,
  'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=800',
  true, 2, 3, 'Aventura', '#2B6CB0', 'manual',
  8, 99, 'Bajo', 'Bajo', 'Málaga', 'Málaga', 'Calle Larios 10, 29015 Málaga',
  '4.4', '4.5', 'Andalucía', '36.7213', '-4.4214',
  'El tesoro del Mediterráneo os espera, marineros',
  'Sigue el mapa del tesoro del pirata Barbanegra del Sur a través de su barco varado.',
  'Barco pirata a escala, efectos de oleaje, puzzles náuticos, cofre del tesoro',
  false, true, false,
  ARRAY['aventura', 'piratas', 'tesoro']::varchar[],
  4.4, 156, true, 'verified'
),
-- 20. Mastermind Málaga - Amenaza Biológica
(
  'b0000001-0000-0000-0000-000000000020',
  'a1b2c3d4-e5f6-7890-abcd-aaaaaaaaaaaa',
  'Amenaza Biológica',
  'Una organización terrorista ha amenazado con liberar un virus letal en la ciudad de Málaga. Las fuerzas especiales han localizado su laboratorio clandestino pero necesitan un equipo de científicos para desactivar el mecanismo de dispersión del virus. Tenéis exactamente 60 minutos antes de que se active la liberación.',
  4, 60, 18.00,
  'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
  true, 2, 5, 'Ciencia ficción', '#C53030', 'manual',
  16, 99, 'Alto', 'Alto', 'Málaga', 'Málaga', 'Calle Larios 10, 29015 Málaga',
  '4.8', '5.0', 'Andalucía', '36.7213', '-4.4214',
  'Un virus. Una ciudad. 60 minutos.',
  'Desactiva el mecanismo de dispersión del virus en un laboratorio terrorista.',
  'Laboratorio biológico, dispositivos de contención, puzzles científicos, tensión extrema',
  false, false, false,
  ARRAY['ciencia ficcion', 'thriller', 'virus']::varchar[],
  4.8, 298, false, 'verified'
)
ON CONFLICT (id) DO NOTHING;

-- Asignar rooms a las colecciones existentes
-- Terror Extremo
INSERT INTO collection_rooms (collection_id, room_id, display_order) VALUES
  ('304b5b1e-249a-4218-8559-363de85c9399', 'b0000001-0000-0000-0000-000000000002', 1),
  ('304b5b1e-249a-4218-8559-363de85c9399', 'b0000001-0000-0000-0000-000000000004', 2),
  ('304b5b1e-249a-4218-8559-363de85c9399', 'b0000001-0000-0000-0000-000000000012', 3),
  ('304b5b1e-249a-4218-8559-363de85c9399', 'b0000001-0000-0000-0000-000000000014', 4),
  ('304b5b1e-249a-4218-8559-363de85c9399', 'b0000001-0000-0000-0000-000000000020', 5)
ON CONFLICT DO NOTHING;

-- Perfectas para Principiantes
INSERT INTO collection_rooms (collection_id, room_id, display_order) VALUES
  ('537255c3-4b72-43fa-8ad4-d5b7bd4f6167', 'b0000001-0000-0000-0000-000000000005', 1),
  ('537255c3-4b72-43fa-8ad4-d5b7bd4f6167', 'b0000001-0000-0000-0000-000000000006', 2),
  ('537255c3-4b72-43fa-8ad4-d5b7bd4f6167', 'b0000001-0000-0000-0000-000000000003', 3),
  ('537255c3-4b72-43fa-8ad4-d5b7bd4f6167', 'b0000001-0000-0000-0000-000000000007', 4),
  ('537255c3-4b72-43fa-8ad4-d5b7bd4f6167', 'b0000001-0000-0000-0000-000000000017', 5),
  ('537255c3-4b72-43fa-8ad4-d5b7bd4f6167', 'b0000001-0000-0000-0000-000000000019', 6)
ON CONFLICT DO NOTHING;

-- Las Mejor Valoradas
INSERT INTO collection_rooms (collection_id, room_id, display_order) VALUES
  ('fd2ecbff-0990-45bf-957e-960b83e81f63', 'b0000001-0000-0000-0000-000000000014', 1),
  ('fd2ecbff-0990-45bf-957e-960b83e81f63', 'b0000001-0000-0000-0000-000000000002', 2),
  ('fd2ecbff-0990-45bf-957e-960b83e81f63', 'b0000001-0000-0000-0000-000000000011', 3),
  ('fd2ecbff-0990-45bf-957e-960b83e81f63', 'b0000001-0000-0000-0000-000000000013', 4),
  ('fd2ecbff-0990-45bf-957e-960b83e81f63', 'b0000001-0000-0000-0000-000000000009', 5)
ON CONFLICT DO NOTHING;

-- Para Grupos Grandes
INSERT INTO collection_rooms (collection_id, room_id, display_order) VALUES
  ('ebed05da-1a39-4d04-a67d-de0560456103', 'b0000001-0000-0000-0000-000000000001', 1),
  ('ebed05da-1a39-4d04-a67d-de0560456103', 'b0000001-0000-0000-0000-000000000005', 2),
  ('ebed05da-1a39-4d04-a67d-de0560456103', 'b0000001-0000-0000-0000-000000000010', 3),
  ('ebed05da-1a39-4d04-a67d-de0560456103', 'b0000001-0000-0000-0000-000000000013', 4),
  ('ebed05da-1a39-4d04-a67d-de0560456103', 'b0000001-0000-0000-0000-000000000018', 5),
  ('ebed05da-1a39-4d04-a67d-de0560456103', 'b0000001-0000-0000-0000-000000000019', 6)
ON CONFLICT DO NOTHING;

-- Nuevas Aperturas (las más recientes)
INSERT INTO collection_rooms (collection_id, room_id, display_order) VALUES
  ('99ae5793-45bf-44bd-bf1c-c2d4fd021c56', 'b0000001-0000-0000-0000-000000000011', 1),
  ('99ae5793-45bf-44bd-bf1c-c2d4fd021c56', 'b0000001-0000-0000-0000-000000000013', 2),
  ('99ae5793-45bf-44bd-bf1c-c2d4fd021c56', 'b0000001-0000-0000-0000-000000000014', 3),
  ('99ae5793-45bf-44bd-bf1c-c2d4fd021c56', 'b0000001-0000-0000-0000-000000000020', 4)
ON CONFLICT DO NOTHING;

-- Crear colecciones adicionales para "Rutas"
INSERT INTO curated_collections (id, slug, title, description, cover_image_url, is_featured, is_active, display_order, theme_color) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'ruta-madrid-imprescindible', 'Ruta Madrid: Lo Imprescindible', 'Las mejores salas de escape de Madrid que todo escapista debe probar. Un recorrido por las experiencias más valoradas de la capital.', 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800', true, true, 5, '#E53E3E'),
  ('c0000001-0000-0000-0000-000000000002', 'ruta-barcelona-gotica', 'Ruta Barcelona Gótica', 'Explora el misterio del Barrio Gótico a través de las salas de escape más atmosféricas de Barcelona. Historia, misterio y terror te esperan.', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', true, true, 6, '#6B46C1'),
  ('c0000001-0000-0000-0000-000000000003', 'ruta-sur-españa', 'Ruta España del Sur', 'De Sevilla a Málaga, las mejores experiencias de escape del sur de España. Calor, misterio y aventura mediterránea.', 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=800', true, true, 7, '#DD6B20'),
  ('c0000001-0000-0000-0000-000000000004', 'terror-para-valientes', 'Solo para Valientes: Terror Total', 'Las salas de escape más terroríficas de España. Con actores en vivo, oscuridad total y sustos garantizados. No apto para cardíacos.', 'https://images.unsplash.com/photo-1509248961085-879c25c4245b?w=800', true, true, 8, '#1A202C'),
  ('c0000001-0000-0000-0000-000000000005', 'familia-divertida', 'Diversión en Familia', 'Salas perfectas para ir con niños y adolescentes. Aventuras emocionantes sin sustos, ideales para hacer en familia.', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800', true, true, 9, '#38A169')
ON CONFLICT (id) DO NOTHING;

-- Asignar rooms a las nuevas rutas
-- Ruta Madrid
INSERT INTO collection_rooms (collection_id, room_id, display_order) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 1),
  ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000002', 2),
  ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000005', 3),
  ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000013', 4),
  ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000014', 5)
ON CONFLICT DO NOTHING;

-- Ruta Barcelona Gótica
INSERT INTO collection_rooms (collection_id, room_id, display_order) VALUES
  ('c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000003', 1),
  ('c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000004', 2),
  ('c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000009', 3),
  ('c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000010', 4)
ON CONFLICT DO NOTHING;

-- Ruta Sur de España
INSERT INTO collection_rooms (collection_id, room_id, display_order) VALUES
  ('c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000007', 1),
  ('c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000008', 2),
  ('c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000019', 3),
  ('c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000020', 4)
ON CONFLICT DO NOTHING;

-- Terror para Valientes
INSERT INTO collection_rooms (collection_id, room_id, display_order) VALUES
  ('c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000002', 1),
  ('c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000004', 2),
  ('c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000012', 3),
  ('c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000014', 4),
  ('c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000020', 5)
ON CONFLICT DO NOTHING;

-- Diversión en Familia
INSERT INTO collection_rooms (collection_id, room_id, display_order) VALUES
  ('c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000003', 1),
  ('c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000005', 2),
  ('c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000006', 3),
  ('c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000009', 4),
  ('c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000017', 5),
  ('c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000019', 6)
ON CONFLICT DO NOTHING;

-- Crear tabla de ofertas si no existe
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage NUMERIC(5,2),
  discount_amount NUMERIC(10,2),
  original_price NUMERIC(10,2),
  offer_price NUMERIC(10,2),
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  coupon_code VARCHAR(50),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  offer_type VARCHAR(50) DEFAULT 'discount',
  conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar ofertas para algunas salas
INSERT INTO offers (id, room_id, title, description, discount_percentage, original_price, offer_price, valid_until, is_active, offer_type, conditions) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '¡25% de descuento en El Bunker!', 'Oferta especial de lanzamiento. Reserva ahora y ahorra en la experiencia del Bunker.', 25.00, 15.00, 11.25, '2025-06-30', true, 'discount', 'Válido de lunes a jueves. Mínimo 4 jugadores.'),
  ('d0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000005', '2x1 en Misión Imposible', 'Trae a un amigo gratis. Paga por 5 y entran 6 jugadores.', NULL, 14.00, 14.00, '2025-05-31', true, '2x1', 'Válido todos los días. Grupo de 6 personas.'),
  ('d0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000009', '20% dto. Taller Da Vinci - Estudiantes', 'Descuento especial para grupos de estudiantes con carnet universitario.', 20.00, 16.00, 12.80, '2025-07-31', true, 'discount', 'Presentar carnet de estudiante. Mínimo 3 jugadores.'),
  ('d0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000013', 'Pack Viaje en el Tiempo - 30% dto.', 'Descuento especial en la sala más innovadora de Madrid. ¡No te lo pierdas!', 30.00, 20.00, 14.00, '2025-04-30', true, 'discount', 'Válido para reservas online. Grupo completo de 6.'),
  ('d0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000003', 'Familiar: La Cripta 15% dto.', 'Descuento familiar: al reservar 4 o más personas, 15% de descuento automático.', 15.00, 16.00, 13.60, '2025-08-31', true, 'discount', 'Mínimo 4 participantes. Al menos 1 menor de 16.'),
  ('d0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000017', 'Happy Hour: El Alquimista', 'Reserva entre semana antes de las 16h y obtén un 20% de descuento.', 20.00, 14.00, 11.20, '2025-12-31', true, 'happy_hour', 'Lunes a viernes, sesiones antes de las 16:00h.'),
  ('d0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000019', 'Verano Pirata: 25% dto.', 'Oferta de verano en Piratas del Mediterráneo. ¡Arrr!', 25.00, 13.00, 9.75, '2025-09-15', true, 'discount', 'Válido solo en junio, julio, agosto y septiembre.'),
  ('d0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000011', 'Última hora: Chernóbil -15%', 'Descuento de última hora para sesiones con disponibilidad.', 15.00, 19.00, 16.15, '2025-05-31', true, 'last_minute', 'Solo para sesiones con al menos 2 plazas libres.')
ON CONFLICT (id) DO NOTHING;
