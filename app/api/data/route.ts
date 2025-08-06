import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || '2025-07';
  const type = searchParams.get('type');

  try {
    const dataDir = path.join(process.cwd(), 'data', month);
    
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({ error: 'Month data not found' }, { status: 404 });
    }

    let data: any = {};

    if (type === 'config') {
      const configPath = path.join(dataDir, 'config.js');
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        // Extract the config object from the JS file
        const configMatch = configContent.match(/config\s*=\s*({[\s\S]*})/);
        if (configMatch) {
          data = eval('(' + configMatch[1] + ')');
        }
      }
    } else if (type === 'completed-projects') {
      const filePath = path.join(dataDir, 'completed-projects.json');
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } else if (type === 'ongoing-projects') {
      const filePath = path.join(dataDir, 'ongoing-projects.json');
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } else if (type === 'incident-report') {
      const filePath = path.join(dataDir, 'incident-report.json');
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } else if (type === 'infra-devops') {
      const filePath = path.join(dataDir, 'infra-devops.json');
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } else if (type === 'security') {
      const filePath = path.join(dataDir, 'security.json');
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } else if (type === 'techops-recurring-tasks') {
      const filePath = path.join(dataDir, 'techops-recurring-tasks.json');
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } else if (type === 'out-of-sprint') {
      const filePath = path.join(dataDir, 'out-of-sprint.json');
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } else {
      // Return all available data types
      const files = fs.readdirSync(dataDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(dataDir, file);
          const fileName = file.replace('.json', '');
          data[fileName] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else if (file === 'config.js') {
          const configPath = path.join(dataDir, 'config.js');
          const configContent = fs.readFileSync(configPath, 'utf8');
          const configMatch = configContent.match(/config\s*=\s*({[\s\S]*})/);
          if (configMatch) {
            data.config = eval('(' + configMatch[1] + ')');
          }
        }
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading data:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
