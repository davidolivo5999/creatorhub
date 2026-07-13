import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

async function verifyMuxSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;
  const parts = Object.fromEntries(signatureHeader.split(',').map((p) => p.split('=')));
  const timestamp = parts.t;
  const v1 = parts.v1;
  if (!timestamp || !v1) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const computed = Array.from(new Uint8Array(sigBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return computed === v1;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const rawBody = await req.text();
    const secret = Deno.env.get('MUX_WEBHOOK_SECRET');
    const signatureHeader = req.headers.get('Mux-Signature');

    const isValid = await verifyMuxSignature(rawBody, signatureHeader, secret);
    if (!isValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { type, data } = body || {};

    if (type === 'video.asset.ready' && data?.id) {
      const matches = await base44.asServiceRole.entities.Video.filter({ mux_asset_id: data.id });
      if (matches.length > 0) {
        const video = matches[0];
        await base44.asServiceRole.entities.Video.update(video.id, {
          status: 'ready',
          playback_id: data.playback_ids?.[0]?.id || video.playback_id || '',
        });

        const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ creator_id: video.created_by_id });
        const notificationsToCreate = [];
        for (const sub of subscriptions) {
          const subscriberUsers = await base44.asServiceRole.entities.User.filter({ id: sub.subscriber_id });
          const subscriber = subscriberUsers[0];
          const pref = subscriber?.notification_pref || 'all';
          if (pref === 'none') continue;
          if (pref === 'personalized') {
            const history = await base44.asServiceRole.entities.WatchHistory.filter({
              user_id: sub.subscriber_id,
              category: video.category,
            });
            if (history.length === 0) continue;
          }
          notificationsToCreate.push({
            user_id: sub.subscriber_id,
            video_id: video.id,
            video_title: video.title,
            creator_name: video.creator_name || '',
          });
        }
        if (notificationsToCreate.length > 0) {
          await base44.asServiceRole.entities.Notification.bulkCreate(notificationsToCreate);
        }
      }
    }

    if (type === 'video.asset.errored' && data?.id) {
      const matches = await base44.asServiceRole.entities.Video.filter({ mux_asset_id: data.id });
      if (matches.length > 0) {
        await base44.asServiceRole.entities.Video.update(matches[0].id, { status: 'error' });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});