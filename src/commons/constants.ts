import { DatabaseType } from '@tresdoce-nestjs-toolkit/typeorm';

export const allowedDbTypes: readonly DatabaseType[] = [
  'mysql',
  'mariadb',
  'postgres',
  'cockroachdb',
  'sqlite',
  'mssql',
  'sap',
  'oracle',
  'cordova',
  'nativescript',
  'react-native',
  'sqljs',
  'mongodb',
  'aurora-mysql',
  'aurora-postgres',
  'spanner',
];
