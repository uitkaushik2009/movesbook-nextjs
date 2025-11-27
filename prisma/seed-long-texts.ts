import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample long texts for testing Tab 3
const LONG_TEXTS = {
  // System Administration & Homepage
  'welcome_message': {
    en: 'Welcome to Movesbook! Your comprehensive training management platform designed for athletes, coaches, and teams. Track your workouts, analyze performance metrics, connect with your coaching network, and achieve your fitness goals with our powerful suite of tools and features.',
    it: 'Benvenuti su Movesbook! La vostra piattaforma completa di gestione degli allenamenti progettata per atleti, allenatori e squadre. Monitorate i vostri allenamenti, analizzate le metriche delle prestazioni, collegatevi con la vostra rete di coaching e raggiungete i vostri obiettivi di fitness con la nostra potente suite di strumenti e funzionalità.',
    fr: 'Bienvenue sur Movesbook ! Votre plateforme complète de gestion d\'entraînement conçue pour les athlètes, les entraîneurs et les équipes. Suivez vos entraînements, analysez les métriques de performance, connectez-vous avec votre réseau de coaching et atteignez vos objectifs de fitness avec notre puissante suite d\'outils et de fonctionnalités.',
    de: 'Willkommen bei Movesbook! Ihre umfassende Trainingsverwaltungsplattform für Sportler, Trainer und Teams. Verfolgen Sie Ihre Trainingseinheiten, analysieren Sie Leistungskennzahlen, vernetzen Sie sich mit Ihrem Coaching-Netzwerk und erreichen Sie Ihre Fitnessziele mit unserer leistungsstarken Tool- und Funktionspalette.',
    es: '¡Bienvenido a Movesbook! Tu plataforma integral de gestión de entrenamiento diseñada para atletas, entrenadores y equipos. Rastrea tus entrenamientos, analiza métricas de rendimiento, conéctate con tu red de coaching y alcanza tus objetivos de fitness con nuestro poderoso conjunto de herramientas y funciones.',
    category: 'system'
  },
  'about_us_description': {
    en: 'Movesbook was founded by passionate athletes and coaches who understand the challenges of training management. Our mission is to provide the most intuitive and powerful platform for workout planning, performance tracking, and team collaboration. We believe that with the right tools, every athlete can reach their full potential and every coach can maximize their impact.',
    it: 'Movesbook è stata fondata da atleti e allenatori appassionati che comprendono le sfide della gestione degli allenamenti. La nostra missione è fornire la piattaforma più intuitiva e potente per la pianificazione degli allenamenti, il monitoraggio delle prestazioni e la collaborazione in team. Crediamo che con gli strumenti giusti, ogni atleta possa raggiungere il proprio pieno potenziale e ogni allenatore possa massimizzare il proprio impatto.',
    fr: 'Movesbook a été fondé par des athlètes et des entraîneurs passionnés qui comprennent les défis de la gestion de l\'entraînement. Notre mission est de fournir la plateforme la plus intuitive et la plus puissante pour la planification des entraînements, le suivi des performances et la collaboration en équipe. Nous croyons qu\'avec les bons outils, chaque athlète peut atteindre son plein potentiel et chaque entraîneur peut maximiser son impact.',
    de: 'Movesbook wurde von leidenschaftlichen Athleten und Trainern gegründet, die die Herausforderungen des Trainingsmanagements verstehen. Unsere Mission ist es, die intuitivste und leistungsstärkste Plattform für Trainingsplanung, Leistungsverfolgung und Teamzusammenarbeit bereitzustellen. Wir glauben, dass mit den richtigen Werkzeugen jeder Athlet sein volles Potenzial erreichen und jeder Trainer seine Wirkung maximieren kann.',
    es: 'Movesbook fue fundado por atletas y entrenadores apasionados que entienden los desafíos de la gestión del entrenamiento. Nuestra misión es proporcionar la plataforma más intuitiva y poderosa para la planificación de entrenamientos, el seguimiento del rendimiento y la colaboración en equipo. Creemos que con las herramientas adecuadas, cada atleta puede alcanzar su máximo potencial y cada entrenador puede maximizar su impacto.',
    category: 'system'
  },
  'privacy_policy': {
    en: 'Your privacy is important to us. This privacy policy explains how Movesbook collects, uses, and protects your personal information. We collect data necessary to provide our services, including workout data, performance metrics, and account information. We never sell your data to third parties and use industry-standard encryption to protect your information. You have the right to access, modify, or delete your data at any time.',
    it: 'La tua privacy è importante per noi. Questa politica sulla privacy spiega come Movesbook raccoglie, utilizza e protegge le tue informazioni personali. Raccogliamo i dati necessari per fornire i nostri servizi, inclusi dati di allenamento, metriche delle prestazioni e informazioni sull\'account. Non vendiamo mai i tuoi dati a terze parti e utilizziamo la crittografia standard del settore per proteggere le tue informazioni. Hai il diritto di accedere, modificare o eliminare i tuoi dati in qualsiasi momento.',
    fr: 'Votre confidentialité est importante pour nous. Cette politique de confidentialité explique comment Movesbook collecte, utilise et protège vos informations personnelles. Nous collectons les données nécessaires pour fournir nos services, y compris les données d\'entraînement, les métriques de performance et les informations de compte. Nous ne vendons jamais vos données à des tiers et utilisons un cryptage standard de l\'industrie pour protéger vos informations. Vous avez le droit d\'accéder, de modifier ou de supprimer vos données à tout moment.',
    de: 'Ihre Privatsphäre ist uns wichtig. Diese Datenschutzrichtlinie erklärt, wie Movesbook Ihre persönlichen Informationen sammelt, verwendet und schützt. Wir sammeln die Daten, die zur Bereitstellung unserer Dienste erforderlich sind, einschließlich Trainingsdaten, Leistungskennzahlen und Kontoinformationen. Wir verkaufen Ihre Daten niemals an Dritte und verwenden branchenübliche Verschlüsselung zum Schutz Ihrer Informationen. Sie haben das Recht, jederzeit auf Ihre Daten zuzugreifen, sie zu ändern oder zu löschen.',
    es: 'Tu privacidad es importante para nosotros. Esta política de privacidad explica cómo Movesbook recopila, utiliza y protege tu información personal. Recopilamos datos necesarios para proporcionar nuestros servicios, incluidos datos de entrenamiento, métricas de rendimiento e información de cuenta. Nunca vendemos tus datos a terceros y utilizamos encriptación estándar de la industria para proteger tu información. Tienes derecho a acceder, modificar o eliminar tus datos en cualquier momento.',
    category: 'system'
  },
  
  // Social & Sport
  'community_guidelines': {
    en: 'Our community is built on respect, support, and shared passion for fitness and athletics. We expect all members to treat each other with kindness and professionalism. Harassment, discrimination, or inappropriate content will not be tolerated. Share your achievements, support others in their journey, and help create a positive environment where everyone can thrive. Remember, we are all working towards our goals together.',
    it: 'La nostra comunità è costruita sul rispetto, il supporto e la passione condivisa per il fitness e l\'atletica. Ci aspettiamo che tutti i membri si trattino con gentilezza e professionalità. Molestie, discriminazioni o contenuti inappropriati non saranno tollerati. Condividi i tuoi successi, supporta gli altri nel loro percorso e aiuta a creare un ambiente positivo dove tutti possano prosperare. Ricorda, stiamo tutti lavorando insieme verso i nostri obiettivi.',
    fr: 'Notre communauté est construite sur le respect, le soutien et la passion partagée pour le fitness et l\'athlétisme. Nous attendons de tous les membres qu\'ils se traitent avec gentillesse et professionnalisme. Le harcèlement, la discrimination ou le contenu inapproprié ne seront pas tolérés. Partagez vos réalisations, soutenez les autres dans leur parcours et aidez à créer un environnement positif où tout le monde peut s\'épanouir. Rappelez-vous, nous travaillons tous ensemble vers nos objectifs.',
    de: 'Unsere Gemeinschaft basiert auf Respekt, Unterstützung und gemeinsamer Leidenschaft für Fitness und Leichtathletik. Wir erwarten, dass alle Mitglieder einander mit Freundlichkeit und Professionalität behandeln. Belästigung, Diskriminierung oder unangemessene Inhalte werden nicht toleriert. Teilen Sie Ihre Erfolge, unterstützen Sie andere auf ihrem Weg und helfen Sie, eine positive Umgebung zu schaffen, in der jeder gedeihen kann. Denken Sie daran, wir arbeiten alle gemeinsam auf unsere Ziele hin.',
    es: 'Nuestra comunidad se basa en el respeto, el apoyo y la pasión compartida por el fitness y el atletismo. Esperamos que todos los miembros se traten con amabilidad y profesionalismo. No se tolerará el acoso, la discriminación o el contenido inapropiado. Comparte tus logros, apoya a otros en su viaje y ayuda a crear un ambiente positivo donde todos puedan prosperar. Recuerda, todos estamos trabajando juntos hacia nuestros objetivos.',
    category: 'social'
  },
  'athlete_profile_instructions': {
    en: 'Complete your athlete profile to get the most out of Movesbook. Add your sports, training history, personal bests, and goals. This information helps coaches understand your background and create personalized training plans. Upload a profile photo, connect with other athletes, and showcase your achievements. A complete profile makes it easier for coaches and teammates to find and connect with you.',
    it: 'Completa il tuo profilo atleta per ottenere il massimo da Movesbook. Aggiungi i tuoi sport, la storia degli allenamenti, i record personali e gli obiettivi. Queste informazioni aiutano gli allenatori a comprendere il tuo background e a creare piani di allenamento personalizzati. Carica una foto profilo, connettiti con altri atleti e mostra i tuoi successi. Un profilo completo rende più facile per allenatori e compagni di squadra trovarti e connettersi con te.',
    fr: 'Complétez votre profil d\'athlète pour tirer le meilleur parti de Movesbook. Ajoutez vos sports, votre historique d\'entraînement, vos records personnels et vos objectifs. Ces informations aident les entraîneurs à comprendre votre parcours et à créer des plans d\'entraînement personnalisés. Téléchargez une photo de profil, connectez-vous avec d\'autres athlètes et mettez en valeur vos réalisations. Un profil complet facilite la recherche et la connexion pour les entraîneurs et les coéquipiers.',
    de: 'Vervollständigen Sie Ihr Athletenprofil, um das Beste aus Movesbook herauszuholen. Fügen Sie Ihre Sportarten, Trainingsgeschichte, persönliche Bestleistungen und Ziele hinzu. Diese Informationen helfen Trainern, Ihren Hintergrund zu verstehen und personalisierte Trainingspläne zu erstellen. Laden Sie ein Profilfoto hoch, vernetzen Sie sich mit anderen Athleten und präsentieren Sie Ihre Erfolge. Ein vollständiges Profil macht es Trainern und Teamkollegen leichter, Sie zu finden und sich mit Ihnen zu verbinden.',
    es: 'Completa tu perfil de atleta para aprovechar al máximo Movesbook. Agrega tus deportes, historial de entrenamiento, mejores marcas personales y objetivos. Esta información ayuda a los entrenadores a comprender tu trayectoria y crear planes de entrenamiento personalizados. Sube una foto de perfil, conéctate con otros atletas y muestra tus logros. Un perfil completo facilita que entrenadores y compañeros de equipo te encuentren y se conecten contigo.',
    category: 'social'
  },
  
  // Management
  'coach_onboarding': {
    en: 'Welcome to Movesbook Coach Dashboard! As a coach, you have access to powerful tools for managing your athletes and teams. Start by creating your coaching groups, inviting athletes, and setting up training plans. Use the analytics dashboard to track athlete progress, identify areas for improvement, and adjust training programs. You can create workout templates, share them with athletes, and monitor completion rates. Our platform makes it easy to communicate with your athletes and keep everyone on track.',
    it: 'Benvenuti nella Dashboard Coach di Movesbook! Come allenatore, hai accesso a potenti strumenti per gestire i tuoi atleti e le tue squadre. Inizia creando i tuoi gruppi di coaching, invitando atleti e impostando piani di allenamento. Usa il dashboard di analisi per monitorare i progressi degli atleti, identificare aree di miglioramento e adattare i programmi di allenamento. Puoi creare modelli di allenamento, condividerli con gli atleti e monitorare i tassi di completamento. La nostra piattaforma rende facile comunicare con i tuoi atleti e mantenere tutti sulla strada giusta.',
    fr: 'Bienvenue sur le tableau de bord des entraîneurs Movesbook ! En tant qu\'entraîneur, vous avez accès à des outils puissants pour gérer vos athlètes et équipes. Commencez par créer vos groupes de coaching, inviter des athlètes et configurer des plans d\'entraînement. Utilisez le tableau de bord d\'analyse pour suivre les progrès des athlètes, identifier les domaines à améliorer et ajuster les programmes d\'entraînement. Vous pouvez créer des modèles d\'entraînement, les partager avec les athlètes et surveiller les taux d\'achèvement. Notre plateforme facilite la communication avec vos athlètes et maintient tout le monde sur la bonne voie.',
    de: 'Willkommen im Movesbook Coach Dashboard! Als Trainer haben Sie Zugriff auf leistungsstarke Tools zur Verwaltung Ihrer Athleten und Teams. Beginnen Sie mit der Erstellung Ihrer Coaching-Gruppen, laden Sie Athleten ein und richten Sie Trainingspläne ein. Verwenden Sie das Analyse-Dashboard, um den Fortschritt der Athleten zu verfolgen, Verbesserungsbereiche zu identifizieren und Trainingsprogramme anzupassen. Sie können Trainingsvorlagen erstellen, sie mit Athleten teilen und Abschlussraten überwachen. Unsere Plattform erleichtert die Kommunikation mit Ihren Athleten und hält alle auf Kurs.',
    es: '¡Bienvenido al Panel de Entrenadores de Movesbook! Como entrenador, tienes acceso a herramientas poderosas para gestionar a tus atletas y equipos. Comienza creando tus grupos de coaching, invitando atletas y configurando planes de entrenamiento. Usa el panel de análisis para rastrear el progreso de los atletas, identificar áreas de mejora y ajustar programas de entrenamiento. Puedes crear plantillas de entrenamiento, compartirlas con atletas y monitorear tasas de finalización. Nuestra plataforma facilita la comunicación con tus atletas y mantiene a todos en el camino correcto.',
    category: 'management'
  },
  'team_management_guide': {
    en: 'Managing a team on Movesbook is simple and efficient. Create your team, add members with different roles (captain, player, reserve), and organize training sessions. Use the team calendar to schedule practices and competitions. Track team performance metrics, compare individual progress, and identify top performers. Share workout plans with the entire team or specific groups. Communication tools allow you to send announcements, share updates, and keep everyone informed. Build a stronger, more connected team with Movesbook.',
    it: 'Gestire una squadra su Movesbook è semplice ed efficiente. Crea la tua squadra, aggiungi membri con ruoli diversi (capitano, giocatore, riserva) e organizza sessioni di allenamento. Usa il calendario della squadra per programmare allenamenti e competizioni. Monitora le metriche delle prestazioni della squadra, confronta i progressi individuali e identifica i migliori performer. Condividi piani di allenamento con l\'intera squadra o gruppi specifici. Gli strumenti di comunicazione ti permettono di inviare annunci, condividere aggiornamenti e tenere tutti informati. Costruisci una squadra più forte e connessa con Movesbook.',
    fr: 'Gérer une équipe sur Movesbook est simple et efficace. Créez votre équipe, ajoutez des membres avec différents rôles (capitaine, joueur, remplaçant) et organisez des séances d\'entraînement. Utilisez le calendrier d\'équipe pour programmer les entraînements et les compétitions. Suivez les métriques de performance de l\'équipe, comparez les progrès individuels et identifiez les meilleurs performeurs. Partagez des plans d\'entraînement avec toute l\'équipe ou des groupes spécifiques. Les outils de communication vous permettent d\'envoyer des annonces, de partager des mises à jour et de tenir tout le monde informé. Construisez une équipe plus forte et plus connectée avec Movesbook.',
    de: 'Die Verwaltung eines Teams auf Movesbook ist einfach und effizient. Erstellen Sie Ihr Team, fügen Sie Mitglieder mit verschiedenen Rollen hinzu (Kapitän, Spieler, Reserve) und organisieren Sie Trainingseinheiten. Verwenden Sie den Teamkalender, um Übungen und Wettkämpfe zu planen. Verfolgen Sie Teamleistungskennzahlen, vergleichen Sie individuelle Fortschritte und identifizieren Sie Top-Performer. Teilen Sie Trainingspläne mit dem gesamten Team oder bestimmten Gruppen. Kommunikationstools ermöglichen es Ihnen, Ankündigungen zu senden, Updates zu teilen und alle auf dem Laufenden zu halten. Bauen Sie mit Movesbook ein stärkeres, besser vernetztes Team auf.',
    es: 'Gestionar un equipo en Movesbook es simple y eficiente. Crea tu equipo, agrega miembros con diferentes roles (capitán, jugador, reserva) y organiza sesiones de entrenamiento. Usa el calendario del equipo para programar prácticas y competiciones. Rastrea métricas de rendimiento del equipo, compara el progreso individual e identifica a los mejores desempeños. Comparte planes de entrenamiento con todo el equipo o grupos específicos. Las herramientas de comunicación te permiten enviar anuncios, compartir actualizaciones y mantener a todos informados. Construye un equipo más fuerte y conectado con Movesbook.',
    category: 'management'
  }
};

async function main() {
  console.log('🌱 Seeding long texts for Tab 3 testing...\n');

  const languages = await prisma.language.findMany();
  
  if (languages.length === 0) {
    console.error('❌ No languages found! Please run seed-all-languages.ts first.');
    process.exit(1);
  }

  let created = 0;
  let updated = 0;

  for (const [key, data] of Object.entries(LONG_TEXTS)) {
    console.log(`Processing: ${key} (${data.category})`);
    
    for (const lang of languages) {
      const translation = data[lang.code as keyof typeof data];
      
      if (typeof translation === 'string') {
        try {
          await prisma.translation.upsert({
            where: {
              key_languageId: {
                key: key,
                languageId: lang.id,
              },
            },
            update: {
              value: translation,
              category: data.category,
              descriptionEn: `Long text for ${key}`,
            },
            create: {
              key: key,
              languageId: lang.id,
              value: translation,
              category: data.category,
              descriptionEn: `Long text for ${key}`,
            },
          });
          
          created++;
        } catch (error) {
          console.error(`  ❌ Error for ${lang.code}:`, error);
        }
      }
    }
    console.log(`  ✅ Created/updated for all languages`);
  }

  console.log(`\n✨ Done!`);
  console.log(`📊 Added ${Object.keys(LONG_TEXTS).length} long text keys`);
  console.log(`💾 Total translations created/updated: ${created}`);
  console.log(`\n📍 Distribution:`);
  console.log(`   - System: 3 long texts`);
  console.log(`   - Social & Sport: 2 long texts`);
  console.log(`   - Management: 2 long texts`);
  console.log(`\n🎯 Now check Tab 3 in the app!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding long texts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

