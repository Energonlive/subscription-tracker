import crypto from 'crypto';
import fs from 'fs';
import path from 'path';


const generateSecureSecret = (bytes: number = 64): string => {
    return crypto.randomBytes(bytes).toString('hex');
}

const targetEnvFilename = '.env.development.local';

const updateJwtInEnv = (): void => {
    const envPath  = path.join(process.cwd(), targetEnvFilename);

    const jwtSecret = generateSecureSecret(64);
    const jwtRefreshSecret = generateSecureSecret(64);
    const jwtExpiresIn = '1d';
    const jwtRefreshExpiresIn = '7d'; 

    const newEntries: Record<string, string> = {
        JWT_SECRET: jwtSecret,
        JWT_REFRESH_SECRET: jwtRefreshSecret,
        JWT_EXPIRES_IN: jwtExpiresIn,
        JWT_REFRESH_EXPIRES_IN: jwtRefreshExpiresIn
    };

    if(!fs.existsSync(envPath)){
        console.error(`env file does not exist: ${envPath}`);
        return;
    }

    let envContent = fs.readFileSync(envPath, {encoding: 'utf-8'});
    const tmpPath = `${envPath}.tmp`;
    const envComent = '#JWT Configurations\n';
    let isAppended = false

    try{
        for (const [key, value] of Object.entries(newEntries)){
            const lineRegex = new RegExp(`^\\s*${key}\\s*=.*$`, 'm')
            const line = `${key}=${value}`;
            if(lineRegex.test(envContent)){
                envContent = envContent.replace(lineRegex, line);
            }else{
                if(!isAppended){
                    if(!envContent.endsWith('\n')) envContent += '\n';
                    envContent += envComent;
                    isAppended = true;
                }
                envContent += `${line}\n`;
            }
        }

        fs.writeFileSync(tmpPath, envContent, {encoding: 'utf-8'});
        fs.renameSync(tmpPath, envPath);

        console.log(`Updated JWT cofig in ${envPath}`);
    }catch (err){
        try{ if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath); } catch{ console.error(`Failed to delete tmp file`);}
        console.error('Failed to update env file:', (err as Error).message);
    }
};

updateJwtInEnv();