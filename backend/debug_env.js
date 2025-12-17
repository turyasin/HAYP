
require('dotenv').config();

const url = process.env.DATABASE_URL;
if (!url) {
    console.log("DATABASE_URL is undefined");
} else {
    const parts = url.replace('postgresql://', '').split(':');
    const userPart = parts[0];
    console.log("Username (User part before colon):", userPart);

    // Mask password
    const masked = url.replace(/:([^:@]+)@/, ':****@');
    console.log("Read DATABASE_URL:", masked);
    console.log("String Length:", url.length);
    console.log("Starts with 'postgresql://':", url.startsWith('postgresql://'));
}
