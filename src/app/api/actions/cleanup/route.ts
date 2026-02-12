import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import path from 'path';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { stdout } = await execAsync(
      `${path.join(os.homedir(), 'projects', 'control-center', 'scripts', 'memory-cleanup.sh')} 90`,
      { timeout: 30000 }
    );
    return NextResponse.json({ success: true, output: stdout });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
