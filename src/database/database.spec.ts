import { Database } from './database';

const mockQuery = jest.fn();
const mockEnd = jest.fn();

jest.mock('pg', () => ({
  __esModule: true,
  default: {
    Pool: jest.fn().mockImplementation(() => ({
      query: mockQuery,
      end: mockEnd,
    })),
  },
}));

describe('Database', () => {
  let database: Database;

  beforeEach(() => {
    mockQuery.mockReset();
    mockEnd.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    database = new Database();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true when the query succeeds', async () => {
    mockQuery.mockResolvedValue({ rows: [{ '?column?': 1 }] });

    await expect(database.health()).resolves.toBe(true);
    expect(mockQuery).toHaveBeenCalledWith('SELECT 1');
  });

  it('returns false and logs when the query fails', async () => {
    mockQuery.mockRejectedValue(new Error('connection refused'));

    await expect(database.health()).resolves.toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  it('stays usable across repeated calls (does not end the pool)', async () => {
    mockQuery.mockResolvedValue({});

    await expect(database.health()).resolves.toBe(true);
    await expect(database.health()).resolves.toBe(true);
    expect(mockEnd).not.toHaveBeenCalled();
  });

  it('recovers after a failure', async () => {
    mockQuery.mockRejectedValueOnce(new Error('down')).mockResolvedValue({});

    await expect(database.health()).resolves.toBe(false);
    await expect(database.health()).resolves.toBe(true);
  });

  it('closes the pool on module destroy', async () => {
    mockEnd.mockResolvedValue(undefined);

    await database.onModuleDestroy();
    expect(mockEnd).toHaveBeenCalledTimes(1);
  });
});
