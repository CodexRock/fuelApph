import { Station } from '../types';

export function getBrandFromName(name: string): Station['brand'] {
    const searchName = name.toLowerCase();

    if (searchName.includes('shell') || searchName.includes('شل')) return 'Shell';

    if (
        searchName.includes('afriquia') ||
        searchName.includes('إفريقيا') ||
        searchName.includes('افريقيا') ||
        searchName.includes('afrique') ||
        searchName.includes('afriqua')
    ) return 'Afriquia';

    if (searchName.includes('total')) return 'TotalEnergies';

    if (searchName.includes('winxo') || searchName.includes('وينكسو')) return 'Winxo';

    if (
        searchName.includes('ola') ||
        searchName.includes('olibya') ||
        searchName.includes('oilybia') ||
        searchName.includes('oillibya') ||
        searchName.includes('oillybia')
    ) return 'Ola Energy';

    if (searchName.includes('petromin') || searchName.includes('بيتروم')) return 'Petromin';

    if (searchName.includes('petrom') || searchName.includes('بتروم')) return 'Petrom';

    if (searchName.includes('ziz')) return 'Ziz';

    if (searchName.includes('somap') || searchName.includes('سوماپ')) return 'Somap';

    if (searchName.includes('leclerc')) return 'E.Leclerc';

    return 'Other';
}

export function isValidStation(name: string, brand: Station['brand']): boolean {
    if (brand !== 'Other') return true;

    const searchName = name.toLowerCase().trim();

    // Explicitly forbidden generic names
    const forbidden = [
        'other station', 'station service', 'fixme', 'unknown station',
        'unknown', 'test', 'station', 'محطة', 'service', 'station gas',
        'gas station', 'petrol station', 'fuel station'
    ];

    if (forbidden.includes(searchName)) return false;

    if (searchName.length < 3) return false;

    const validKeywords = [
        'station', 'محطة', 'aire', 'service', 'oil', 'gaz', 'gas',
        'pompe', 'diesel', 'essence', 'petrol', 'petro', 'fuel',
        'بنزين', 'غاز', 'بترول', 'pna', 'cmh', 'cphm', 'atlas',
        'aral', 'ziz', 'somap', 'petrofib', 'salama', 'samir', 'bacha'
    ];

    return validKeywords.some(keyword => searchName.includes(keyword));
}

export function getShortBrand(brand: Station['brand']): string {
    switch (brand) {
        case 'TotalEnergies': return 'Total';
        case 'Ola Energy': return 'Ola';
        case 'Petromin': return 'Petromin';
        case 'E.Leclerc': return 'Leclerc';
        case 'Other': return 'Indép.';
        default: return brand;
    }
}

export function getTimeAgo(timestamp: number): string {
    if (!timestamp) return '---';
    const now = Date.now();
    const diffHours = Math.floor((now - timestamp) / 3600000);

    if (diffHours < 24) return 'NEW';

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
}
