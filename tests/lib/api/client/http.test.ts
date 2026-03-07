import { beforeEach, describe, expect, it, vi } from 'vitest';

import { http } from '@/lib/api/client/http';

vi.mock('@/lib/api/client/core', () => ({
  client: vi.fn(),
}));

const { client } = await import('@/lib/api/client/core');

describe('http', () => {
  beforeEach(() => {
    vi.mocked(client).mockResolvedValue({
      status: 'success',
      message: 'OK',
      data: undefined,
    });
  });

  it('get calls client with GET method', async () => {
    await http.get('users');
    expect(client).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('post calls client with POST method and body', async () => {
    await http.post('users', { name: 'Alice' });
    expect(client).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({
        method: 'POST',
        body: { name: 'Alice' },
      }),
    );
  });

  it('put calls client with PUT method and body', async () => {
    await http.put('users/1', { name: 'Bob' });
    expect(client).toHaveBeenCalledWith(
      'users/1',
      expect.objectContaining({
        method: 'PUT',
        body: { name: 'Bob' },
      }),
    );
  });

  it('patch calls client with PATCH method and body', async () => {
    await http.patch('users/1', { email: 'new@example.com' });
    expect(client).toHaveBeenCalledWith(
      'users/1',
      expect.objectContaining({
        method: 'PATCH',
        body: { email: 'new@example.com' },
      }),
    );
  });

  it('delete calls client with DELETE method', async () => {
    await http.delete('users/1');
    expect(client).toHaveBeenCalledWith(
      'users/1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('get forwards options to client', async () => {
    await http.get('users', { cache: 'force-cache' });
    expect(client).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({ method: 'GET', cache: 'force-cache' }),
    );
  });

  it('post forwards options when body is provided', async () => {
    await http.post('users', { name: 'Alice' }, { throwOnError: false });
    expect(client).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({
        method: 'POST',
        body: { name: 'Alice' },
        throwOnError: false,
      }),
    );
  });
});
