// components/admin/AffiliatesForm.js
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

function AffiliatesForm({ onCreated }) {
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [commissionRate, setCommissionRate] = useState('0.1');
  const [metadataStr, setMetadataStr] = useState('');

  const create = async () => {
    try {
      if (!name) return alert('Name required.');
      if (!referralCode) return alert('Referral code required.');

      const payload = {
        name,
        referral_code: referralCode,
        commission_rate: Number(commissionRate),
        status: 'active',
        metadata: metadataStr ? safeJSON(metadataStr, {}) : {},
      };

      const { error } = await supabase.from('affiliates').insert(payload);
      if (error) throw error;

      setName('');
      setReferralCode('');
      setCommissionRate('0.1');
      setMetadataStr('');
      onCreated?.();
      alert('Affiliate created.');
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    }
  };

  return (
    <SectionCard title="Affiliates — Add Partner">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Partner Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Referral Code"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
        />
        <input
          placeholder="Commission Rate (e.g., 0.1 for 10%)"
          type="number"
          step="0.01"
          value={commissionRate}
          onChange={(e) => setCommissionRate(e.target.value)}
        />
        <textarea
          className="md:col-span-3"
          placeholder='Metadata (JSON, e.g., {"partner_type":"influencer"})'
          value={metadataStr}
          onChange={(e) => setMetadataStr(e.target.value)}
        />
        <button
          type="button"
          onClick={create}
          className="md:col-span-3 px-4 py-2 rounded bg-blue-600 text-white"
        >
          Create Affiliate
        </button>
      </div>
    </SectionCard>
  );
}

export default AffiliatesForm;