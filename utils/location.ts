// Morocco bounding box approximate
// Includes Western Sahara (Southern Provinces)
export const MOROCCO_BOUNDS = {
    south: 21.0,
    north: 36.5,
    west: -17.5,
    east: -0.5
};

export function isInsideMorocco(lat: number, lng: number): boolean {
    return (
        lat >= MOROCCO_BOUNDS.south &&
        lat <= MOROCCO_BOUNDS.north &&
        lng >= MOROCCO_BOUNDS.west &&
        lng <= MOROCCO_BOUNDS.east
    );
}

export function getFunnyMoroccoRestrictionMessage(): string {
    const messages = [
        "Désolé, on n'est pas encore arrivés jusque-là ! 🌍 FuelSpy ne fonctionne qu'au Maroc pour l'instant ! 🇲🇦",
        "Holà ! Tu es hors zone ! 🚀 Ici c'est le Maroc, reste dans les frontières pour tes bons plans ! 🇲🇦",
        "Oups ! On dirait que tu es en voyage... ✈️ FuelSpy t'attend sagement au Maroc ! 🇲🇦",
        "On adore l'aventure, mais FuelSpy préfère le thé à la menthe et le Maroc ! 🍵🇲🇦"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}
