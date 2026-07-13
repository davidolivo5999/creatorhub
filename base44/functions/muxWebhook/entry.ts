import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// NOTE: This is a mock webhook handler (no signature verification yet).
// Once MUX_WEBHOOK_SECRET is set, verify the "Mux-Signature" header before trusting the body.
// Expected mock payload shape: { type: "video.asset.ready", data: { upload_id, asset_id, playback_ids: [{ id }] } }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { type, data } = body || {};

    if (type === 'video.asset.ready' && data?.upload_id) {
      const matches = await base44.asServiceRole.entities.Video.filter({ mux_upload_id: data.upload_id });
      if (matches.length > 0) {
        await base44.asServiceRole.entities.Video.update(matches[0].id, {
          status: 'ready',
          mux_asset_id: data.asset_id || '',
          playback_id: data.playback_ids?.[0]?.id || '',
        });
      }
    }

    if (type === 'video.asset.errored' && data?.upload_id) {
      const matches = await base44.asServiceRole.entities.Video.filter({ mux_upload_id: data.upload_id });
      if (matches.length > 0) {
        await base44.asServiceRole.entities.Video.update(matches[0].id, { status: 'error' });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});