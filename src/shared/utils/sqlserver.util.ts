import sql from 'mssql';

// Parse connection string dari .env
const parseConnectionString = (connectionString: string) => {
  // Format: sqlserver://host:port;database=dbname;user=username;password=pass;encrypt=true;trustServerCertificate=true
  const url = connectionString.replace('sqlserver://', '');
  const [hostPort, ...params] = url.split(';');
  const [host, port] = hostPort.split(':');

  const config: any = {
    server: host,
    port: parseInt(port || '1433'),
    options: {
      enableArithAbort: true,
    },
  };

  params.forEach((param) => {
    const [key, value] = param.split('=');
    if (key === 'database') {
      config.database = value;
    } else if (key === 'user') {
      config.user = value;
    } else if (key === 'password') {
      config.password = value;
    } else if (key === 'encrypt') {
      config.options.encrypt = value === 'true';
    } else if (key === 'trustServerCertificate') {
      config.options.trustServerCertificate = value === 'true';
    }
  });

  return config;
};

const connectionString = process.env.SQLSERVER_URL || '';
const config: sql.config = parseConnectionString(connectionString);

// Add connection pool settings
config.pool = {
  max: 10,
  min: 0,
  idleTimeoutMillis: 30000,
};

let pool: sql.ConnectionPool | null = null;

export const connectSqlServer = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log('✅ SQL Server connected successfully');
      console.log(`   Server: ${config.server}:${config.port}`);
      console.log(`   Database: ${config.database}`);
    }
    return pool;
  } catch (error) {
    console.error('❌ SQL Server connection error:', error);
    throw error;
  }
};

export const getSqlServerPool = () => {
  if (!pool) {
    throw new Error('SQL Server not connected. Call connectSqlServer() first.');
  }
  return pool;
};

export const disconnectSqlServer = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('SQL Server disconnected');
    }
  } catch (error) {
    console.error('Error disconnecting SQL Server:', error);
  }
};

// Helper untuk raw query
export const querySqlServer = async <T = any>(queryString: string): Promise<T[]> => {
  const pool = getSqlServerPool();
  const result = await pool.request().query(queryString);
  return result.recordset;
};

// Helper untuk query dengan parameters
export const querySqlServerWithParams = async <T = any>(
  queryString: string,
  params: Record<string, any>
): Promise<T[]> => {
  const pool = getSqlServerPool();
  const request = pool.request();

  // Add parameters
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });

  const result = await request.query(queryString);
  return result.recordset;
};
