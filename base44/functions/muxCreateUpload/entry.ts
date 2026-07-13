import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// NOTE: This is a mock implementation. Once MUX_TOKEN_ID / MUX_TOKEN_SECRET are set,
// replace the mock block below with a real call to https://api.mux.com/video/v1/uploads
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'creator') {
      return Response.json({ error: 'Only creators can upload videos' }, { status: 403 });
    }

    const { title, description, file_url } = await req.json();
    if (!title || !file_url) {
      return Response.json({ error: 'title and file_url are required' }, { status: 400 });
    }

    // --- MOCK Mux "create upload" response ---
    const mockUploadId = `mock_upload_${crypto.randomUUID()}`;

    const video = await base44.entities.Video.create({
      title,
      description: description || '',
      file_url,
      mux_upload_id: mockUploadId,
      status: 'processing',
    });

    return Response.json({ video, mock: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});