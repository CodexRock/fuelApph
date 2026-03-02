import React, { createContext, useContext, useState } from 'react';

export type Language = 'fr' | 'en' | 'ar';

interface Translations {
  [key: string]: any;
}

const en: Translations = {
  nav: {
    explore: 'Explore',
    search: 'Search',
    scan: 'Scan',
    rewards: 'Rewards',
    profile: 'Profile'
  },
  onboarding: {
    title: 'Save on every',
    titleHighlight: 'Liter.',
    subtitle: 'Join the largest community of drivers in Morocco finding the best fuel prices in real-time.',
    getStarted: 'Get Started',
    locationTitle: 'Find Nearby Stations',
    locationSubtitle: 'FuelSpy needs your location to show you the cheapest gas stations around you and enable 1-tap price verification.',
    allowLocation: 'Allow Location Access',
    skip: 'Skip for now'
  },
  app: {
    snapSave: 'Snap & Save',
    snapDesc: 'Report any station price board to earn rewards. Our AI handles the verification instantly.',
    startScanning: 'Start Scanning',
    unknown: 'Unknown',
    searchResults: 'Search Results',
    locationRequired: 'Location permission is required to report or confirm prices.',
    tooFar: 'You must be within 150 meters of the station to report or confirm.',
    error: 'An error occurred.',
    success: 'Success!',
    cancel: 'Cancel',
    confirm: 'Confirm',
    ok: 'OK',
    locationReminderTitle: 'Location Required',
    locationReminderDesc: "Hello! You can't add prices or confirm and gain points without location access. Please allow location to find the closest stations, use the app fully, and earn points and gifts!"
  },
  profile: {
    level: 'LVL',
    expertTracker: 'Expert Tracker • Top 1% in Rabat',
    savings: 'Savings',
    reports: 'Reports',
    rank: 'Rank',
    leaderboard: 'Leaderboard',
    leaderboardDesc: 'Check your rank',
    referrals: 'Referrals',
    referralsDesc: 'Earn 100 pts',
    fuelLogs: 'Fuel Logs',
    fuelLogsDesc: 'Track efficiency',
    badges: 'Badges',
    badgesDesc: '12/45 Unlocked',
    vehicleSettings: 'Vehicle Settings',
    paymentMethods: 'Payment Methods',
    accountSecurity: 'Account Security',
    helpCenter: 'Help Center',
    language: 'Language',
    languageDesc: 'English / Français',
    signOut: 'Sign Out'
  },
  languageSettings: {
    title: 'Language / Langue',
    select: 'Select your preferred language:'
  },
  map: {
    searchPlaceholder: 'Search city... (Press Enter)',
    startLocation: 'Start: Current Location',
    route: 'Route',
    whereTo: 'Where are you going?',
    dragPin: 'Drag map to place pin',
    confirmLocation: 'Confirm Location',
    locationNotFound: 'Location not found. Try another city or area in Morocco.',
    cheapestRoute: 'Cheapest on Route',
    cheapestNearby: 'Cheapest Nearby',
    madL: 'MAD / L',
    mins: 'MINS',
    startJourney: 'Start Journey'
  },
  station: {
    mapImport: 'Map Import',
    beFirst: 'Be the first!',
    ghostDesc: 'Google Maps tells us there is a {brand} here. Verify it by scanning the price board to earn a massive pioneer reward.',
    scanNow: 'Scan Prices Now +500 PTS',
    enterManually: 'Or enter manually',
    diesel: 'Diesel',
    sansPlomb: 'Unleaded',
    premium: 'Premium',
    needsVerification: 'Needs Verification',
    verifiedBy: 'Verified by',
    community: 'Community',
    openWaze: 'Open Waze',
    googleMaps: 'Google Maps',
    confirmPrices: 'Confirm Current Prices',
    verified10: 'Verified! +10 Points',
    reportChange: 'Report Change',
    scanBoard: 'Scan Price Board',
    aiVerification: 'AI Verification (OCR)',
    voice: 'Voice',
    manual: 'Manual',
    openNow: 'Open Now',
    drive: 'Drive',
    earn50: 'Earn +50 pts',
    availableServices: 'Available Services',
    ratingStation: 'Rating Station...',
    close: 'Close'
  },
  nearby: {
    nearbyStations: 'Nearby Stations',
    map: 'Map',
    searchArea: 'Search area or station...',
    cheapest: 'Cheapest',
    nearest: 'Nearest',
    verified: 'Verified',
    bestPrice: 'Best Price',
    noStationsFound: 'No stations found matching your criteria.'
  },
  search: {
    findFuel: 'Find Fuel',
    searchPlaceholder: 'Search station or city...',
    cheapest: 'Cheapest',
    nearest: 'Nearest',
    myRewards: 'My Rewards',
    recentSearches: 'Recent Searches',
    clear: 'Clear',
    away: 'away',
    popularCities: 'Popular Cities',
    stations: 'Stations',
    filterBrand: 'Filter by Brand',
    amenities: 'Amenities',
    fuelType: 'Fuel Type',
    applyFilters: 'Apply Filters',
    showResults: 'Show Results'
  },
  amenities: {
    'Café': 'Café',
    'Shop': 'Shop',
    'Air': 'Air',
    'WC': 'WC',
    'Mosque': 'Mosque',
    'ATM': 'ATM',
    'Car Wash': 'Car Wash',
    'EV Charge': 'EV Charge'
  },
  scanFlow: {
    pointBoard: 'Point at price board',
    aiDetect: 'AI will automatically detect fuel and prices',
    analyzing: 'Analyzing Data',
    glareFallback: "If glare blocks the view, we'll switch to manual entry...",
    verifyDetails: 'Verify Details',
    confirmInfo: 'Confirm the information detected is correct',
    detectedFuel: 'Detected Fuel',
    pricePerLiter: 'Price Per Liter (MAD)',
    tapToType: 'Tap to type or use +/-',
    looksGood: 'Looks Good, Submit',
    editManually: 'Edit Manually'
  },
  manualReport: {
    reportPrice: 'Report Price',
    confirmPrice: 'Confirm Price',
    change: 'Change'
  },
  voiceReport: {
    title: 'Voice Reporter',
    listening: 'Listening...',
    verifyResult: 'Verify Result',
    instruction: 'Tell me the fuel type and price',
    example: '(e.g., "Diesel 12.50")',
    adjustManual: 'Adjust details manually if AI made a mistake',
    fuelType: 'Fuel Type',
    priceMad: 'Price (MAD)',
    tapToAdjust: 'Tap +/- to adjust',
    retake: 'Retake',
    confirm: 'Confirm'
  },
  addStation: {
    title: 'Add New Station',
    pioneerReward: 'Pioneer Reward: +200 PTS',
    selectBrand: 'Select Brand',
    whatStation: 'What gas station is located here?',
    nextStep: 'Next Step',
    station: 'Station',
    currentDieselPrice: 'Current Diesel Price',
    madLiter: 'MAD / Liter',
    claimReward: 'Claim Pioneer Reward'
  },
  contributionSuccess: {
    stationAdded: 'STATION ADDED!',
    priceVerified: 'PRICE VERIFIED!',
    pioneerMsg: 'You are a community pioneer',
    thanksMsg: 'Thanks for keeping prices accurate',
    calculating: 'Calculating Reward...',
    pioneerBonus: 'Pioneer Bonus',
    mysteryReward: 'Mystery Reward',
    contributionLogged: 'Contribution Logged',
    contributionVerified: 'Contribution Verified',
    wait: 'Wait for it...',
    returnToMap: 'Awesome, Return to Map'
  },
  rewards: {
    shopTitle: 'Rewards Shop',
    walletTitle: 'My Wallet',
    wallet: 'Wallet',
    shop: 'Shop',
    availableBalance: 'Available Balance',
    silverMember: 'Silver Member',
    goldTarget: 'Gold (3,000 pts)',
    hotDeal: 'Hot Deal',
    limitedTime: 'Limited Time',
    hotDealTitle: 'Free Espresso at TotalEnergies',
    hotDealDesc: 'Valid at any station highway cafe',
    redeemNow: 'Redeem Now',
    redeem: 'Redeem',
    goals: 'Goals',
    keepEarning: 'Keep earning',
    oilChange: 'Full Oil Change',
    progress: 'Progress',
    lifetimeSavings: 'Total Lifetime Savings',
    savedThisMonth: 'Saved this month: +{value} DH',
    active: 'Active',
    history: 'History',
    expiresSoon: 'Expires soon',
    presentQr: 'Present this QR code to the station attendant before payment.',
    voucherCode: 'Voucher Code',
    markAsUsed: 'Mark as Used',
    noVouchers: 'No active vouchers yet',
    visitShop: 'Visit the Shop',
    confirmRedeemTitle: 'Confirm Redemption',
    confirmRedeemDesc: 'Are you sure you want to redeem your points for this voucher?',
    notEnoughPoints: 'Not enough points for this voucher.',
    redeemSuccess: 'Voucher redeemed successfully!',
    pts: 'PTS',
    mad: 'MAD',
    cats: { all: 'All', fuel: 'Fuel', wash: 'Car Wash', food: 'Food' },
    items: {
      washTitle: 'Basic Car Wash', washDesc: 'Exterior wash and tire shine at participating stations.',
      fuelTitle: '50 DH Fuel Voucher', fuelDesc: 'Discount on your next fill-up at Afriquia.',
      foodTitle: 'Breakfast Combo', foodDesc: 'Coffee and croissant at Shell Select.',
      fluidTitle: 'Screen Wash 1L', fluidDesc: 'High quality screen wash fluid.'
    }
  },
  leaderboard: {
    topReporters: 'Top Reporters',
    localTab: 'Maarif (Local)',
    globalTab: 'Morocco (Global)',
    restOfPack: 'The Rest of the pack',
    updatedAgo: 'Updated 5m ago',
    yourRank: 'Your Rank',
    topLocal: 'Top 1% in Maarif',
    topGlobal: 'Top 12% globally',
    spots: 'spots'
  },
  referrals: {
    title: 'Invite Friends',
    shareSavings: 'Share the Savings.',
    desc1: 'Both you and your friend get ',
    desc2: '100 points',
    desc3: ' when they scan their first receipt.',
    step1: 'Send link',
    step2: 'They scan',
    step3: 'Both earn',
    yourCode: 'Your personal code',
    inviteNow: 'Invite Now'
  },
  vehicleLog: {
    title: 'My Vehicle',
    newLog: 'New Fuel Log',
    avgUsage: 'Avg. Usage',
    lower: 'lower',
    totalCost: 'Total Cost',
    last30Days: 'Last 30 days',
    efficiencyTrend: 'Efficiency Trend',
    sixMonths: '6 Months',
    recentLogs: 'Recent Logs',
    months: { may: 'May', aug: 'Aug', oct: 'Oct' },
    stationName: 'Station Name',
    cost: 'Cost (DH)',
    volume: 'Volume (L)',
    odometer: 'Odometer (km)',
    saveLog: 'Save Log',
    saving: 'Saving...',
    cancel: 'Cancel'
  },
  notifications: {
    title: 'Activity',
    markAll: 'Mark All',
    today: 'Today',
    yesterday: 'Yesterday',
    notifs: {
      dropTitle: 'Price Drop Alert', dropMsg: 'Shell prices dropped -0.50 MAD near Casablanca center.',
      rewardTitle: 'Report Verified!', rewardMsg: 'Your submission for Afriquia was verified. You earned +50 points.',
      rankTitle: 'Rank Up!', rankMsg: 'You entered the top 100 reporters in Rabat. Keep going!'
    }
  },
  badges: {
    title: 'My Journey',
    totalBadges: 'Total Badges',
    eliteTier: 'Elite Tier',
    list: {
      b1: 'First Scan', b2: 'Watcher', b3: 'Early Bird',
      b4: 'Highway Hero', b5: 'Atlas Explorer', b6: 'Night Owl',
      b7: 'Verified Scout', b8: 'Trend Setter', b9: 'Community Pillar'
    }
  },
  helpCenter: {
    title: 'Help Center',
    search: 'Search topics...',
    faqTitle: 'Frequent Questions',
    faqs: {
      q1: 'How do points work?', a1: 'Earn points by reporting fuel prices. 10 points per report, 50 if verified.',
      q2: 'Where can I use my vouchers?', a2: 'Vouchers are valid at all participating Shell, Afriquia, and TotalEnergies stations.',
      q3: 'Reporting incorrect prices?', a3: 'Users with high trust scores get verified instantly. Others require community confirmation.'
    },
    stillNeedHelp: 'Still need help?',
    support247: 'Our support team is available 24/7',
    contactSupport: 'Contact Support'
  },
  vehicleSettings: {
    title: 'Vehicle Settings',
    category: 'Vehicle Category',
    personal: 'Personal',
    taxi: 'Taxi',
    truck: 'Truck',
    coreInfo: 'Core Info',
    modelName: 'Model Name',
    odometer: 'Odometer',
    primaryFuel: 'Primary Fuel',
    saveChanges: 'Save Changes'
  },
  paymentMethods: {
    title: 'Payments',
    savedCards: 'Saved Cards',
    expires: 'Expires',
    primary: 'Primary',
    addNew: 'Add New Payment Method',
    digitalWallets: 'Digital Wallets'
  },
  securitySettings: {
    title: 'Security',
    auth: 'Authentication',
    changePass: 'Change Password',
    lastChanged: 'Last changed 3 months ago',
    twoFactor: 'Two-Factor (2FA)',
    highlyRec: 'Highly Recommended',
    biometrics: 'Biometrics',
    faceId: 'FaceID / Fingerprint',
    fastLogin: 'Fast login and reporting'
  },
  auth: {
    welcome: 'Welcome back',
    create: 'Create an account',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    processing: 'Processing...',
    noAccount: "Don't have an account? Sign Up",
    hasAccount: "Already have an account? Sign In",
    failed: 'Authentication failed',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to Login',
    newPassword: 'New Password',
    updatePassword: 'Update Password',
    resetSuccess: 'Password updated successfully! You can now sign in.',
    checkEmail: 'Check your email for the reset link.',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Ahmed Benali',
    passwordHint: 'Password must be at least 6 characters',
    continueGoogle: 'Continue with Google',
    continueFacebook: 'Continue with Facebook',
    continueApple: 'Continue with Apple',
    orEmail: 'or with email',
    errorInvalidCredentials: 'Incorrect email or password.',
    errorAlreadyRegistered: 'This email is already registered. Try signing in.',
    errorEmailNotConfirmed: 'Please check your email to confirm your account.',
    errorWeakPassword: 'Password is too weak. Use at least 6 characters.',
    errorRateLimit: 'Too many attempts. Please wait a moment.',
    errorNetwork: 'Connection error. Check your internet.',
    errorNameRequired: 'Please enter your full name.'
  }
};

const fr: Translations = {
  nav: {
    explore: 'Explorer',
    search: 'Rechercher',
    scan: 'Scanner',
    rewards: 'Récompenses',
    profile: 'Profil'
  },
  onboarding: {
    title: 'Économisez sur chaque',
    titleHighlight: 'Litre.',
    subtitle: 'Rejoignez la plus grande communauté de conducteurs au Maroc pour trouver les meilleurs prix de carburant en temps réel.',
    getStarted: 'Commencer',
    locationTitle: 'Trouver des stations',
    locationSubtitle: 'FuelSpy a besoin de votre position pour vous montrer les stations les moins chères et permettre la vérification des prix en un clic.',
    allowLocation: 'Autoriser la position',
    skip: 'Ignorer pour le moment'
  },
  app: {
    snapSave: 'Scanner & Économiser',
    snapDesc: 'Signalez n\'importe quel panneau de prix pour gagner des récompenses. Notre IA s\'occupe de la vérification instantanément.',
    startScanning: 'Commencer le scan',
    unknown: 'Inconnu',
    searchResults: 'Résultats de recherche',
    locationRequired: 'L\'accès à la position est requis pour signaler ou confirmer les prix.',
    tooFar: 'Vous devez être à moins de 150 mètres de la station pour signaler ou confirmer.',
    error: 'Une erreur s\'est produite.',
    success: 'Succès !',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    ok: 'OK',
    locationReminderTitle: 'Position Requise',
    locationReminderDesc: "Bonjour ! Vous ne pouvez pas ajouter ou confirmer de prix et gagner des points sans la localisation. Autorisez la localisation pour trouver les stations les plus proches, utiliser pleinement l'application et gagner des points et cadeaux !"
  },
  profile: {
    level: 'NIV',
    expertTracker: 'Traqueur Expert • Top 1% à Rabat',
    savings: 'Économies',
    reports: 'Signalements',
    rank: 'Classement',
    leaderboard: 'Classement',
    leaderboardDesc: 'Voir votre rang',
    referrals: 'Parrainage',
    referralsDesc: 'Gagnez 100 pts',
    fuelLogs: 'Carnet de bord',
    fuelLogsDesc: 'Suivi de conso',
    badges: 'Badges',
    badgesDesc: '12/45 Débloqués',
    vehicleSettings: 'Paramètres du véhicule',
    paymentMethods: 'Moyens de paiement',
    accountSecurity: 'Sécurité du compte',
    helpCenter: 'Centre d\'aide',
    language: 'Langue',
    languageDesc: 'English / Français',
    signOut: 'Se déconnecter'
  },
  languageSettings: {
    title: 'Langue / Language',
    select: 'Choisissez votre langue préférée :'
  },
  map: {
    searchPlaceholder: 'Rechercher une ville... (Entrée)',
    startLocation: 'Départ : Position actuelle',
    route: 'Itinéraire',
    whereTo: 'Où allez-vous ?',
    dragPin: 'Faites glisser pour placer le repère',
    confirmLocation: 'Confirmer l\'emplacement',
    locationNotFound: 'Lieu introuvable. Essayez une autre ville au Maroc.',
    cheapestRoute: 'Moins cher sur la route',
    cheapestNearby: 'Moins cher à proximité',
    madL: 'MAD / L',
    mins: 'MIN',
    startJourney: 'Démarrer le trajet'
  },
  station: {
    mapImport: 'Importé de la carte',
    beFirst: 'Soyez le premier !',
    ghostDesc: 'Google Maps indique qu\'il y a une station {brand} ici. Vérifiez-la en scannant le panneau des prix pour gagner une récompense pionnier massive.',
    scanNow: 'Scanner les prix +500 PTS',
    enterManually: 'Ou saisir manuellement',
    diesel: 'Gasoil',
    sansPlomb: 'Sans Plomb',
    premium: 'Premium',
    needsVerification: 'Nécessite une vérification',
    verifiedBy: 'Vérifié par',
    community: 'Communauté',
    openWaze: 'Ouvrir Waze',
    googleMaps: 'Google Maps',
    confirmPrices: 'Confirmer les prix',
    verified10: 'Vérifié ! +10 Points',
    reportChange: 'Signaler un changement',
    scanBoard: 'Scanner le panneau',
    aiVerification: 'Vérification IA (OCR)',
    voice: 'Vocal',
    manual: 'Manuel',
    openNow: 'Ouvert maintenant',
    drive: 'Y aller',
    earn50: 'Gagnez +50 pts',
    availableServices: 'Services disponibles',
    ratingStation: 'Évaluation en cours...',
    close: 'Fermer'
  },
  nearby: {
    nearbyStations: 'Stations à proximité',
    map: 'Carte',
    searchArea: 'Rechercher une zone...',
    cheapest: 'Moins cher',
    nearest: 'Plus proche',
    verified: 'Vérifié',
    bestPrice: 'Meilleur prix',
    noStationsFound: 'Aucune station trouvée pour ces critères.'
  },
  search: {
    findFuel: 'Trouver du carburant',
    searchPlaceholder: 'Rechercher station ou ville...',
    cheapest: 'Moins cher',
    nearest: 'Plus proche',
    myRewards: 'Mes récompenses',
    recentSearches: 'Recherches récentes',
    clear: 'Effacer',
    away: 'de distance',
    popularCities: 'Villes populaires',
    stations: 'Stations',
    filterBrand: 'Filtrer par marque',
    amenities: 'Services',
    fuelType: 'Carburant',
    applyFilters: 'Appliquer les filtres',
    showResults: 'Afficher les résultats'
  },
  amenities: {
    'Café': 'Café',
    'Shop': 'Boutique',
    'Air': 'Air / Pression',
    'WC': 'Toilettes',
    'Mosque': 'Mosquée',
    'ATM': 'GAB / Retrait',
    'Car Wash': 'Lavage Auto',
    'EV Charge': 'Borne VE'
  },
  scanFlow: {
    pointBoard: 'Pointez vers le panneau des prix',
    aiDetect: 'L\'IA détectera automatiquement le carburant et les prix',
    analyzing: 'Analyse des données',
    glareFallback: "En cas de reflet, nous passerons en saisie manuelle...",
    verifyDetails: 'Vérifier les détails',
    confirmInfo: 'Confirmez que les informations détectées sont correctes',
    detectedFuel: 'Carburant détecté',
    pricePerLiter: 'Prix au litre (MAD)',
    tapToType: 'Appuyez pour taper ou utilisez +/-',
    looksGood: 'Tout est bon, Soumettre',
    editManually: 'Modifier manuellement'
  },
  manualReport: {
    reportPrice: 'Signaler un prix',
    confirmPrice: 'Confirmer le prix',
    change: 'Modifier'
  },
  voiceReport: {
    title: 'Rapport Vocal',
    listening: 'Écoute en cours...',
    verifyResult: 'Vérifier le résultat',
    instruction: 'Indiquez le type de carburant et le prix',
    example: '(ex: "Gasoil 12.50")',
    adjustManual: 'Ajustez manuellement si l\'IA s\'est trompée',
    fuelType: 'Type de carburant',
    priceMad: 'Prix (MAD)',
    tapToAdjust: 'Appuyez sur +/- pour ajuster',
    retake: 'Recommencer',
    confirm: 'Confirmer'
  },
  addStation: {
    title: 'Ajouter une station',
    pioneerReward: 'Récompense Pionnier : +200 PTS',
    selectBrand: 'Sélectionner la marque',
    whatStation: 'Quelle station-service se trouve ici ?',
    nextStep: 'Étape suivante',
    station: 'Station',
    currentDieselPrice: 'Prix actuel du Gasoil',
    madLiter: 'MAD / Litre',
    claimReward: 'Réclamer la récompense'
  },
  contributionSuccess: {
    stationAdded: 'STATION AJOUTÉE !',
    priceVerified: 'PRIX VÉRIFIÉ !',
    pioneerMsg: 'Vous êtes un pionnier de la communauté',
    thanksMsg: 'Merci de maintenir les prix à jour',
    calculating: 'Calcul de la récompense...',
    pioneerBonus: 'Bonus Pionnier',
    mysteryReward: 'Récompense Mystère',
    contributionLogged: 'Contribution enregistrée',
    contributionVerified: 'Contribution vérifiée',
    wait: 'Patientez...',
    returnToMap: 'Génial, Retour à la carte'
  },
  rewards: {
    shopTitle: 'Boutique de Récompenses',
    walletTitle: 'Mon Portefeuille',
    wallet: 'Portefeuille',
    shop: 'Boutique',
    availableBalance: 'Solde Disponible',
    silverMember: 'Membre Argent',
    goldTarget: 'Or (3 000 pts)',
    hotDeal: 'Bon Plan',
    limitedTime: 'Durée Limitée',
    hotDealTitle: 'Espresso Gratuit chez TotalEnergies',
    hotDealDesc: 'Valable dans tous les cafés sur autoroute',
    redeemNow: 'Échanger Maintenant',
    redeem: 'Échanger',
    goals: 'Objectifs',
    keepEarning: 'Continuez à gagner',
    oilChange: 'Vidange Complète',
    progress: 'Progression',
    lifetimeSavings: 'Économies Totales',
    savedThisMonth: 'Économisé ce mois: +{value} DH',
    active: 'Actifs',
    history: 'Historique',
    expiresSoon: 'Expire bientôt',
    presentQr: 'Présentez ce QR code au pompiste avant le paiement.',
    voucherCode: 'Code du Bon',
    markAsUsed: 'Marquer comme utilisé',
    noVouchers: 'Aucun bon actif pour le moment',
    visitShop: 'Visiter la Boutique',
    confirmRedeemTitle: 'Confirmer l\'échange',
    confirmRedeemDesc: 'Êtes-vous sûr de vouloir échanger vos points contre ce bon ?',
    notEnoughPoints: 'Pas assez de points pour ce bon.',
    redeemSuccess: 'Bon échangé avec succès !',
    pts: 'PTS',
    mad: 'MAD',
    cats: { all: 'Tout', fuel: 'Carburant', wash: 'Lavage', food: 'Nourriture' },
    items: {
      washTitle: 'Lavage Auto Basique', washDesc: 'Lavage extérieur et brillant pneus dans les stations participantes.',
      fuelTitle: 'Bon Carburant 50 DH', fuelDesc: 'Réduction sur votre prochain plein chez Afriquia.',
      foodTitle: 'Menu Petit-déj', foodDesc: 'Café et croissant chez Shell Select.',
      fluidTitle: 'Lave-glace 1L', fluidDesc: 'Liquide lave-glace haute qualité.'
    }
  },
  leaderboard: {
    topReporters: 'Meilleurs Contributeurs',
    localTab: 'Maârif (Local)',
    globalTab: 'Maroc (Global)',
    restOfPack: 'Le reste du classement',
    updatedAgo: 'Mis à jour il y a 5m',
    yourRank: 'Votre Rang',
    topLocal: 'Top 1% à Maârif',
    topGlobal: 'Top 12% mondialement',
    spots: 'places'
  },
  referrals: {
    title: 'Inviter des Amis',
    shareSavings: 'Partagez les Économies.',
    desc1: 'Vous et votre ami obtenez ',
    desc2: '100 points',
    desc3: ' lorsqu\'ils scannent leur premier reçu.',
    step1: 'Envoyer le lien',
    step2: 'Ils scannent',
    step3: 'Vous gagnez',
    yourCode: 'Votre code personnel',
    inviteNow: 'Inviter Maintenant'
  },
  vehicleLog: {
    title: 'Mon Véhicule',
    newLog: 'Nouveau Plein',
    avgUsage: 'Conso Moyenne',
    lower: 'en baisse',
    totalCost: 'Coût Total',
    last30Days: '30 derniers jours',
    efficiencyTrend: 'Tendance d\'efficacité',
    sixMonths: '6 Mois',
    recentLogs: 'Pleins Récents',
    months: { may: 'Mai', aug: 'Aoû', oct: 'Oct' },
    stationName: 'Nom de la station',
    cost: 'Coût (DH)',
    volume: 'Volume (L)',
    odometer: 'Kilométrage (km)',
    saveLog: 'Enregistrer',
    saving: 'Enregistrement...',
    cancel: 'Annuler'
  },
  notifications: {
    title: 'Activité',
    markAll: 'Tout marquer',
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    notifs: {
      dropTitle: 'Alerte Baisse de Prix', dropMsg: 'Les prix Shell ont baissé de -0.50 MAD près du centre de Casablanca.',
      rewardTitle: 'Signalement Vérifié !', rewardMsg: 'Votre signalement pour Afriquia a été vérifié. Vous avez gagné +50 points.',
      rankTitle: 'Niveau Supérieur !', rankMsg: 'Vous êtes entré dans le top 100 des contributeurs à Rabat. Continuez !'
    }
  },
  badges: {
    title: 'Mon Parcours',
    totalBadges: 'Total des Badges',
    eliteTier: 'Niveau Élite',
    list: {
      b1: 'Premier Scan', b2: 'Observateur', b3: 'Lève-tôt',
      b4: 'Héros d\'Autoroute', b5: 'Explorateur de l\'Atlas', b6: 'Oiseau de Nuit',
      b7: 'Éclaireur Vérifié', b8: 'Créateur de Tendance', b9: 'Pilier Communautaire'
    }
  },
  helpCenter: {
    title: 'Centre d\'Aide',
    search: 'Rechercher des sujets...',
    faqTitle: 'Questions Fréquentes',
    faqs: {
      q1: 'Comment fonctionnent les points ?', a1: 'Gagnez des points en signalant les prix. 10 pts par signalement, 50 si vérifié.',
      q2: 'Où utiliser mes bons ?', a2: 'Les bons sont valables dans les stations Shell, Afriquia et TotalEnergies participantes.',
      q3: 'Prix incorrects ?', a3: 'Les utilisateurs avec un score de confiance élevé sont vérifiés instantanément. Les autres nécessitent une confirmation communautaire.'
    },
    stillNeedHelp: 'Encore besoin d\'aide ?',
    support247: 'Notre équipe de support est disponible 24/7',
    contactSupport: 'Contacter le Support'
  },
  vehicleSettings: {
    title: 'Paramètres du Véhicule',
    category: 'Catégorie de Véhicule',
    personal: 'Personnel',
    taxi: 'Taxi',
    truck: 'Camion',
    coreInfo: 'Infos Principales',
    modelName: 'Nom du Modèle',
    odometer: 'Kilométrage',
    primaryFuel: 'Carburant Principal',
    saveChanges: 'Enregistrer'
  },
  paymentMethods: {
    title: 'Paiements',
    savedCards: 'Cartes Enregistrées',
    expires: 'Expire',
    primary: 'Principale',
    addNew: 'Ajouter un Moyen de Paiement',
    digitalWallets: 'Portefeuilles Numériques'
  },
  securitySettings: {
    title: 'Sécurité',
    auth: 'Authentification',
    changePass: 'Changer le Mot de Passe',
    lastChanged: 'Modifié il y a 3 mois',
    twoFactor: 'Double Facteur (2FA)',
    highlyRec: 'Hautement Recommandé',
    biometrics: 'Biométrie',
    faceId: 'FaceID / Empreinte',
    fastLogin: 'Connexion et signalement rapides'
  },
  auth: {
    welcome: 'Bon retour',
    create: 'Créer un compte',
    email: 'E-mail',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    processing: 'Traitement...',
    noAccount: "Vous n'avez pas de compte ? S'inscrire",
    hasAccount: "Vous avez déjà un compte ? Se connecter",
    failed: 'L\'authentification a échoué',
    forgotPassword: 'Mot de passe oublié ?',
    resetPassword: 'Réinitialiser le mot de passe',
    sendResetLink: 'Envoyer le lien de réinitialisation',
    backToLogin: 'Retour à la connexion',
    newPassword: 'Nouveau mot de passe',
    updatePassword: 'Mettre à jour le mot de passe',
    resetSuccess: 'Mot de passe mis à jour avec succès ! Vous pouvez maintenant vous connecter.',
    checkEmail: 'Consultez vos e-mails pour le lien de réinitialisation.',
    fullName: 'Nom complet',
    fullNamePlaceholder: 'Ahmed Benali',
    passwordHint: 'Le mot de passe doit contenir au moins 6 caractères',
    continueGoogle: 'Continuer avec Google',
    continueFacebook: 'Continuer avec Facebook',
    continueApple: 'Continuer avec Apple',
    orEmail: 'ou par e-mail',
    errorInvalidCredentials: 'E-mail ou mot de passe incorrect.',
    errorAlreadyRegistered: 'Cet e-mail est déjà enregistré. Essayez de vous connecter.',
    errorEmailNotConfirmed: 'Veuillez vérifier vos e-mails pour confirmer votre compte.',
    errorWeakPassword: 'Mot de passe trop faible. Utilisez au moins 6 caractères.',
    errorRateLimit: 'Trop de tentatives. Veuillez patienter.',
    errorNetwork: 'Erreur de connexion. Vérifiez votre connexion internet.',
    errorNameRequired: 'Veuillez entrer votre nom complet.'
  }
};

const ar: Translations = {
  nav: {
    explore: 'استكشاف',
    search: 'بحث',
    scan: 'مسح',
    rewards: 'مكافآت',
    profile: 'الملف'
  },
  onboarding: {
    title: 'وفّر على كل',
    titleHighlight: 'لتر.',
    subtitle: 'انضم إلى أكبر مجتمع سائقين في المغرب للعثور على أفضل أسعار الوقود في الوقت الفعلي.',
    getStarted: 'ابدأ الآن',
    locationTitle: 'العثور على محطات قريبة',
    locationSubtitle: 'يحتاج FuelSpy إلى موقعك لإظهار أرخص المحطات القريبة منك.',
    allowLocation: 'السماح بالوصول للموقع',
    skip: 'تخطي الآن'
  },
  app: {
    snapSave: 'صوّر ووفّر',
    snapDesc: 'أبلغ عن لوحة أسعار أي محطة لكسب المكافآت. الذكاء الاصطناعي يتحقق فوراً.',
    startScanning: 'ابدأ المسح',
    unknown: 'غير معروف',
    searchResults: 'نتائج البحث',
    locationRequired: 'يجب تفعيل الموقع للإبلاغ عن الأسعار أو تأكيدها.',
    tooFar: 'يجب أن تكون على بعد 150 متراً من المحطة للإبلاغ أو التأكيد.',
    error: 'حدث خطأ.',
    success: 'تم بنجاح!',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    ok: 'موافق',
    locationReminderTitle: 'الموقع مطلوب',
    locationReminderDesc: 'مرحباً! لا يمكنك إضافة أو تأكيد الأسعار وكسب النقاط بدون تفعيل الموقع. فعّل الموقع للعثور على أقرب المحطات واستخدام التطبيق بالكامل!'
  },
  profile: {
    level: 'مست.',
    expertTracker: 'متتبع خبير • ضمن أفضل 1% في الرباط',
    savings: 'التوفير',
    reports: 'البلاغات',
    rank: 'الترتيب',
    leaderboard: 'لوحة المتصدرين',
    leaderboardDesc: 'تحقق من ترتيبك',
    referrals: 'الإحالات',
    referralsDesc: 'اكسب 100 نقطة',
    fuelLogs: 'سجل الوقود',
    fuelLogsDesc: 'تتبع الاستهلاك',
    badges: 'الشارات',
    badgesDesc: '12/45 مفتوحة',
    vehicleSettings: 'إعدادات المركبة',
    paymentMethods: 'طرق الدفع',
    accountSecurity: 'أمان الحساب',
    helpCenter: 'مركز المساعدة',
    language: 'اللغة',
    languageDesc: 'العربية / Français / English',
    signOut: 'تسجيل الخروج'
  },
  languageSettings: {
    title: 'اللغة',
    select: 'اختر اللغة المفضلة:'
  },
  map: {
    searchPlaceholder: 'ابحث عن مدينة... (اضغط Enter)',
    startLocation: 'البداية: موقعك الحالي',
    route: 'المسار',
    whereTo: 'إلى أين تذهب؟',
    dragPin: 'اسحب الخريطة لوضع العلامة',
    confirmLocation: 'تأكيد الموقع',
    locationNotFound: 'الموقع غير موجود. جرب مدينة أو منطقة أخرى في المغرب.',
    cheapestRoute: 'الأرخص على المسار',
    cheapestNearby: 'الأرخص بالقرب',
    madL: 'د.م / لتر',
    mins: 'دقائق',
    startJourney: 'ابدأ الرحلة'
  },
  station: {
    mapImport: 'مستورد من الخريطة',
    beFirst: 'كن الأول!',
    ghostDesc: 'خرائط Google تشير إلى وجود محطة {brand} هنا. تحقق منها بمسح لوحة الأسعار لكسب مكافأة الرائد.',
    scanNow: 'امسح الأسعار الآن +500 نقطة',
    enterManually: 'أو أدخل يدوياً',
    diesel: 'ديزل',
    sansPlomb: 'بنزين',
    premium: 'ممتاز',
    needsVerification: 'يحتاج تحقق',
    verifiedBy: 'تم التحقق بواسطة',
    community: 'المجتمع',
    openWaze: 'فتح Waze',
    googleMaps: 'خرائط Google',
    confirmPrices: 'تأكيد الأسعار الحالية',
    verified10: 'تم التحقق! +10 نقاط',
    reportChange: 'الإبلاغ عن تغيير',
    scanBoard: 'مسح لوحة الأسعار',
    aiVerification: 'تحقق بالذكاء الاصطناعي',
    voice: 'صوتي',
    manual: 'يدوي',
    openNow: 'مفتوح الآن',
    drive: 'اذهب',
    earn50: 'اكسب +50 نقطة',
    availableServices: 'الخدمات المتاحة',
    ratingStation: 'جاري التقييم...',
    close: 'إغلاق'
  },
  nearby: {
    nearbyStations: 'محطات قريبة',
    map: 'خريطة',
    searchArea: 'ابحث عن منطقة أو محطة...',
    cheapest: 'الأرخص',
    nearest: 'الأقرب',
    verified: 'مُحقق',
    bestPrice: 'أفضل سعر',
    noStationsFound: 'لم يتم العثور على محطات تطابق معاييرك.'
  },
  search: {
    findFuel: 'ابحث عن وقود',
    searchPlaceholder: 'ابحث عن محطة أو مدينة...',
    cheapest: 'الأرخص',
    nearest: 'الأقرب',
    myRewards: 'مكافآتي',
    recentSearches: 'عمليات بحث حديثة',
    clear: 'مسح',
    away: 'بعيد',
    popularCities: 'مدن شائعة',
    stations: 'محطات',
    filterBrand: 'تصفية حسب العلامة التجارية',
    amenities: 'الخدمات',
    fuelType: 'نوع الوقود',
    applyFilters: 'تطبيق الفلاتر',
    showResults: 'عرض النتائج'
  },
  amenities: {
    'Café': 'مقهى',
    'Shop': 'متجر',
    'Air': 'هواء',
    'WC': 'مرحاض',
    'Mosque': 'مسجد',
    'ATM': 'صراف آلي',
    'Car Wash': 'غسيل سيارات',
    'EV Charge': 'شحن كهربائي'
  },
  scanFlow: {
    pointBoard: 'وجّه الكاميرا نحو لوحة الأسعار',
    aiDetect: 'الذكاء الاصطناعي سيكتشف الوقود والأسعار تلقائياً',
    analyzing: 'جاري التحليل',
    glareFallback: 'في حال وجود انعكاس، سننتقل للإدخال اليدوي...',
    verifyDetails: 'تحقق من التفاصيل',
    confirmInfo: 'تأكد أن المعلومات المكتشفة صحيحة',
    detectedFuel: 'الوقود المكتشف',
    pricePerLiter: 'السعر لكل لتر (د.م)',
    tapToType: 'اضغط للكتابة أو استخدم +/-',
    looksGood: 'يبدو صحيحاً، إرسال',
    editManually: 'تعديل يدوياً'
  },
  manualReport: {
    reportPrice: 'الإبلاغ عن سعر',
    confirmPrice: 'تأكيد السعر',
    change: 'تغيير'
  },
  voiceReport: {
    title: 'الإبلاغ الصوتي',
    listening: 'جاري الاستماع...',
    verifyResult: 'تحقق من النتيجة',
    instruction: 'أخبرني نوع الوقود والسعر',
    example: '(مثال: "ديزل 12.50")',
    adjustManual: 'عدّل التفاصيل يدوياً إذا أخطأ الذكاء الاصطناعي',
    fuelType: 'نوع الوقود',
    priceMad: 'السعر (د.م)',
    tapToAdjust: 'اضغط +/- للتعديل',
    retake: 'إعادة',
    confirm: 'تأكيد'
  },
  addStation: {
    title: 'إضافة محطة جديدة',
    pioneerReward: 'مكافأة الرائد: +200 نقطة',
    selectBrand: 'اختر العلامة التجارية',
    whatStation: 'ما هي محطة الوقود الموجودة هنا؟',
    nextStep: 'الخطوة التالية',
    station: 'محطة',
    currentDieselPrice: 'سعر الديزل الحالي',
    madLiter: 'د.م / لتر',
    claimReward: 'اطلب المكافأة'
  },
  contributionSuccess: {
    stationAdded: 'تمت إضافة المحطة!',
    priceVerified: 'تم التحقق من السعر!',
    pioneerMsg: 'أنت رائد في المجتمع',
    thanksMsg: 'شكراً لتحديث الأسعار',
    calculating: 'جاري حساب المكافأة...',
    pioneerBonus: 'مكافأة الرائد',
    mysteryReward: 'مكافأة غامضة',
    contributionLogged: 'تم تسجيل المساهمة',
    contributionVerified: 'تم التحقق من المساهمة',
    wait: 'انتظر...',
    returnToMap: 'رائع، العودة للخريطة'
  },
  rewards: {
    shopTitle: 'متجر المكافآت',
    walletTitle: 'محفظتي',
    wallet: 'المحفظة',
    shop: 'المتجر',
    availableBalance: 'الرصيد المتاح',
    silverMember: 'عضو فضي',
    goldTarget: 'ذهبي (3,000 نقطة)',
    hotDeal: 'عرض مميز',
    limitedTime: 'لفترة محدودة',
    hotDealTitle: 'إسبريسو مجاني في TotalEnergies',
    hotDealDesc: 'صالح في جميع مقاهي محطات الطرق السريعة',
    redeemNow: 'استبدل الآن',
    redeem: 'استبدال',
    goals: 'الأهداف',
    keepEarning: 'استمر في الكسب',
    oilChange: 'تغيير زيت كامل',
    progress: 'التقدم',
    lifetimeSavings: 'إجمالي التوفير',
    savedThisMonth: 'تم توفير هذا الشهر: +{value} د.م',
    active: 'نشطة',
    history: 'السجل',
    expiresSoon: 'ينتهي قريباً',
    presentQr: 'اعرض رمز QR على عامل المحطة قبل الدفع.',
    voucherCode: 'رمز القسيمة',
    markAsUsed: 'تحديد كمُستخدم',
    noVouchers: 'لا توجد قسائم نشطة بعد',
    visitShop: 'زيارة المتجر',
    confirmRedeemTitle: 'تأكيد الاستبدال',
    confirmRedeemDesc: 'هل أنت متأكد من استبدال نقاطك بهذه القسيمة؟',
    notEnoughPoints: 'نقاط غير كافية لهذه القسيمة.',
    redeemSuccess: 'تم استبدال القسيمة بنجاح!',
    pts: 'نقطة',
    mad: 'د.م',
    cats: { all: 'الكل', fuel: 'وقود', wash: 'غسيل', food: 'طعام' },
    items: {
      washTitle: 'غسيل سيارة أساسي', washDesc: 'غسيل خارجي ولمعان الإطارات في المحطات المشاركة.',
      fuelTitle: 'قسيمة وقود 50 د.م', fuelDesc: 'خصم على التعبئة القادمة في أفريقيا.',
      foodTitle: 'وجبة إفطار', foodDesc: 'قهوة وكرواسون في Shell Select.',
      fluidTitle: 'سائل مسّاحات 1 لتر', fluidDesc: 'سائل مسّاحات عالي الجودة.'
    }
  },
  leaderboard: {
    topReporters: 'أفضل المبلغين',
    localTab: 'المعاريف (محلي)',
    globalTab: 'المغرب (عام)',
    restOfPack: 'بقية المتصدرين',
    updatedAgo: 'تم التحديث منذ 5 دقائق',
    yourRank: 'ترتيبك',
    topLocal: 'ضمن أفضل 1% في المعاريف',
    topGlobal: 'ضمن أفضل 12% عالمياً',
    spots: 'مراكز'
  },
  referrals: {
    title: 'دعوة الأصدقاء',
    shareSavings: 'شارك التوفير.',
    desc1: 'أنت وصديقك تحصلان على ',
    desc2: '100 نقطة',
    desc3: ' عندما يمسح أول إيصال.',
    step1: 'أرسل الرابط',
    step2: 'يمسحون',
    step3: 'كلاكما يكسب',
    yourCode: 'رمزك الشخصي',
    inviteNow: 'ادعُ الآن'
  },
  vehicleLog: {
    title: 'مركبتي',
    newLog: 'سجل وقود جديد',
    avgUsage: 'متوسط الاستهلاك',
    lower: 'أقل',
    totalCost: 'التكلفة الإجمالية',
    last30Days: 'آخر 30 يوماً',
    efficiencyTrend: 'اتجاه الكفاءة',
    sixMonths: '6 أشهر',
    recentLogs: 'سجلات حديثة',
    months: { may: 'مايو', aug: 'أغسطس', oct: 'أكتوبر' },
    stationName: 'اسم المحطة',
    cost: 'التكلفة (د.م)',
    volume: 'الحجم (لتر)',
    odometer: 'عداد المسافة (كم)',
    saveLog: 'حفظ',
    saving: 'جاري الحفظ...',
    cancel: 'إلغاء'
  },
  notifications: {
    title: 'النشاط',
    markAll: 'تحديد الكل',
    today: 'اليوم',
    yesterday: 'أمس',
    notifs: {
      dropTitle: 'تنبيه انخفاض السعر', dropMsg: 'أسعار Shell انخفضت -0.50 د.م بالقرب من وسط الدار البيضاء.',
      rewardTitle: 'تم التحقق من البلاغ!', rewardMsg: 'تم التحقق من بلاغك لأفريقيا. كسبت +50 نقطة.',
      rankTitle: 'ترقية!', rankMsg: 'دخلت ضمن أفضل 100 مُبلغ في الرباط. استمر!'
    }
  },
  badges: {
    title: 'رحلتي',
    totalBadges: 'إجمالي الشارات',
    eliteTier: 'المستوى النخبوي',
    list: {
      b1: 'أول مسح', b2: 'المراقب', b3: 'الباكر',
      b4: 'بطل الطريق السريع', b5: 'مستكشف الأطلس', b6: 'بومة الليل',
      b7: 'الكشّاف المُحقق', b8: 'صانع الاتجاه', b9: 'ركيزة المجتمع'
    }
  },
  helpCenter: {
    title: 'مركز المساعدة',
    search: 'ابحث عن مواضيع...',
    faqTitle: 'الأسئلة الشائعة',
    faqs: {
      q1: 'كيف تعمل النقاط؟', a1: 'اكسب نقاطاً بالإبلاغ عن أسعار الوقود. 10 نقاط لكل بلاغ، 50 إذا تم التحقق.',
      q2: 'أين أستخدم قسائمي؟', a2: 'القسائم صالحة في جميع محطات Shell وأفريقيا وTotalEnergies المشاركة.',
      q3: 'أسعار غير صحيحة؟', a3: 'المستخدمون ذوو درجة ثقة عالية يتم التحقق منهم فوراً. الآخرون يحتاجون تأكيد المجتمع.'
    },
    stillNeedHelp: 'لا تزال بحاجة للمساعدة؟',
    support247: 'فريق الدعم متاح على مدار الساعة',
    contactSupport: 'التواصل مع الدعم'
  },
  vehicleSettings: {
    title: 'إعدادات المركبة',
    category: 'نوع المركبة',
    personal: 'شخصية',
    taxi: 'سيارة أجرة',
    truck: 'شاحنة',
    coreInfo: 'المعلومات الأساسية',
    modelName: 'اسم الطراز',
    odometer: 'عداد المسافة',
    primaryFuel: 'الوقود الأساسي',
    saveChanges: 'حفظ التغييرات'
  },
  paymentMethods: {
    title: 'المدفوعات',
    savedCards: 'البطاقات المحفوظة',
    expires: 'ينتهي',
    primary: 'أساسية',
    addNew: 'إضافة طريقة دفع جديدة',
    digitalWallets: 'المحافظ الرقمية'
  },
  securitySettings: {
    title: 'الأمان',
    auth: 'المصادقة',
    changePass: 'تغيير كلمة المرور',
    lastChanged: 'آخر تغيير منذ 3 أشهر',
    twoFactor: 'المصادقة الثنائية',
    highlyRec: 'موصى به بشدة',
    biometrics: 'البيومترية',
    faceId: 'بصمة الوجه / الإصبع',
    fastLogin: 'تسجيل دخول وإبلاغ سريع'
  },
  auth: {
    welcome: 'مرحباً بعودتك',
    create: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    processing: 'جاري المعالجة...',
    noAccount: 'ليس لديك حساب؟ سجّل الآن',
    hasAccount: 'لديك حساب بالفعل؟ سجّل الدخول',
    failed: 'فشل المصادقة',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetPassword: 'إعادة تعيين كلمة المرور',
    sendResetLink: 'إرسال رابط إعادة التعيين',
    backToLogin: 'العودة لتسجيل الدخول',
    newPassword: 'كلمة المرور الجديدة',
    updatePassword: 'تحديث كلمة المرور',
    resetSuccess: 'تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.',
    checkEmail: 'تحقق من بريدك الإلكتروني لرابط إعادة التعيين.',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'أحمد البنعلي',
    passwordHint: 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل',
    continueGoogle: 'المتابعة مع Google',
    continueFacebook: 'المتابعة مع Facebook',
    continueApple: 'المتابعة مع Apple',
    orEmail: 'أو بالبريد الإلكتروني',
    errorInvalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    errorAlreadyRegistered: 'هذا البريد الإلكتروني مسجل بالفعل. جرب تسجيل الدخول.',
    errorEmailNotConfirmed: 'يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.',
    errorWeakPassword: 'كلمة المرور ضعيفة جداً. استخدم 6 أحرف على الأقل.',
    errorRateLimit: 'محاولات كثيرة جداً. يرجى الانتظار.',
    errorNetwork: 'خطأ في الاتصال. تحقق من الإنترنت.',
    errorNameRequired: 'يرجى إدخال اسمك الكامل.'
  }
};

const translations: Record<Language, Translations> = { fr, en, ar };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string | any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('fuelspy_language') as Language) || 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fuelspy_language', lang);
    // Set document direction for RTL support
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  // Set initial direction on mount
  React.useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, []);

  const t = (path: string) => {
    const keys = path.split('.');
    let result = translations[language];
    for (const key of keys) {
      if (result[key] === undefined) return path;
      result = result[key];
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};