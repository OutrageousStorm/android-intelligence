#!/usr/bin/env node
/**
 * device-lookup.ts
 * Lookup Android device specs, codenames, and ROM availability
 * Usage: npx ts-node device-lookup.ts "Pixel 8" | grep -i lineage
 * Or: npm install && npm run lookup "Samsung Galaxy S21"
 */

interface DeviceEntry {
    model: string;
    codename: string;
    manufacturer: string;
    releaseYear: number;
    supported_roms: {
        grapheneos?: boolean;
        lineageos?: boolean;
        crdroid?: boolean;
        pixelexperience?: boolean;
        calyxos?: boolean;
    };
}

const DEVICES: DeviceEntry[] = [
    {
        model: "Pixel 8",
        codename: "shiba",
        manufacturer: "Google",
        releaseYear: 2024,
        supported_roms: {
            grapheneos: true,
            lineageos: true,
            crdroid: true,
        }
    },
    {
        model: "Pixel 8 Pro",
        codename: "husky",
        manufacturer: "Google",
        releaseYear: 2024,
        supported_roms: {
            grapheneos: true,
            lineageos: true,
        }
    },
    {
        model: "Galaxy S23",
        codename: "dm1q",
        manufacturer: "Samsung",
        releaseYear: 2023,
        supported_roms: {
            lineageos: true,
            crdroid: true,
        }
    },
    {
        model: "OnePlus 12",
        codename: "galileo",
        manufacturer: "OnePlus",
        releaseYear: 2024,
        supported_roms: {
            lineageos: true,
            crdroid: true,
        }
    },
    {
        model: "Xiaomi 14",
        codename: "psyche",
        manufacturer: "Xiaomi",
        releaseYear: 2024,
        supported_roms: {
            crdroid: true,
        }
    },
];

function search(query: string): DeviceEntry[] {
    const q = query.toLowerCase();
    return DEVICES.filter(d =>
        d.model.toLowerCase().includes(q) ||
        d.codename.toLowerCase().includes(q) ||
        d.manufacturer.toLowerCase().includes(q)
    );
}

function printDevice(d: DeviceEntry): void {
    console.log(`\n📱 ${d.model} (${d.codename})`);
    console.log(`   Manufacturer: ${d.manufacturer}`);
    console.log(`   Released: ${d.releaseYear}`);
    console.log(`   Supported ROMs:`);
    Object.entries(d.supported_roms).forEach(([rom, supported]) => {
        if (supported) console.log(`     ✅ ${rom.toUpperCase()}`);
    });
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("Usage: device-lookup <query>");
        console.log("Example: device-lookup 'Pixel 8'");
        process.exit(1);
    }

    const query = args.join(" ");
    const results = search(query);

    if (results.length === 0) {
        console.log(`No devices found for: ${query}`);
        process.exit(1);
    }

    console.log(`Found ${results.length} device(s):`);
    results.forEach(printDevice);
}

main().catch(console.error);
