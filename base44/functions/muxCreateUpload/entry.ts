import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'creator' && user.role !== 'admin') {
      return Response.json({ error: 'Only creators can upload videos' }, { status: 403 });
    }

    const { title, description, file_url } = await req.json();
    if (!title || !file_url) {
      return Response.json({ error: 'title and file_url are required' }, { status: 400 });
    }

    const tokenId = Deno.env.get('MUX_TOKEN_ID');
    const tokenSecret = Deno.env.get('MUX_TOKEN_SECRET');
    const basicAuth = btoa(`${tokenId}:${tokenSecret}`);

    const muxRes = await fetch('https://api.mux.com/video/v1/assets', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: [{ url: file_url }],
        playback_policy: ['public'],
      }),
    });

    const muxData = await muxRes.json();
    if (!muxRes.ok) {
      return Response.json({ error: muxData?.error?.messages?.join(', ') || 'Mux request failed' }, { status: 500 });
    }

    const asset = muxData.data;
    const playbackId = asset?.playback_ids?.[0]?.id || '';

    const video = await base44.entities.Video.create({
      title,
      description: description || '',
      file_url,
      creator_name: user.full_name || '',
      mux_asset_id: asset.id,
      playback_id: playbackId,
      status: asset.status === 'ready' ? 'ready' : 'processing',
    });

    return Response.json({ video });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});