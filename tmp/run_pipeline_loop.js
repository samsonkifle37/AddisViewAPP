const { execSync } = require('child_process');

async function loop() {
    for(let i=0; i<5; i++) {
        console.log(`Running pipeline iteration ${i+1}...`);
        try {
            execSync('npx tsx scripts/etl/image_pipeline.ts', { stdio: 'inherit' });
        } catch(e) {}
    }
}
loop();
