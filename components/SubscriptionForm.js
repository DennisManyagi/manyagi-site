const SubscriptionForm = ({ formId, uid, title, description, includeTelegramId = false }) => {
  return (
    <div aria-labelledby="form-title" className="space-y-4">
      <h3 id="form-title" className="text-2xl font-bold text-black">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
      <script async src="https://f.convertkit.com/ckjs/ck.5.js"></script>
      <form
        action={`https://app.convertkit.com/forms/${formId}/subscriptions`}
        className="seva-form formkit-form"
        method="post"
        data-sv-form={formId}
        data-uid={uid}
        data-format="inline"
        data-version="5"
        target="_blank"
      >
        <input
          className="w-full p-3 border border-gray-300 rounded bg-white text-black mb-2"
          name="fields[first_name]"
          placeholder="First Name"
          type="text"
        />
        <input
          className="w-full p-3 border border-gray-300 rounded bg-white text-black mb-2"
          name="email_address"
          placeholder="Email Address"
          required
          type="email"
        />
        {includeTelegramId && (
          <input
            className="w-full p-3 border border-gray-300 rounded bg-white text-black mb-2"
            name="fields[telegram_id]"
            placeholder="Telegram ID (e.g., 123456789)"
            type="text"
          />
        )}
        <button
          className="w-full py-3 bg-yellow-500 text-black rounded font-bold hover:bg-yellow-400"
          type="submit"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
};

export default SubscriptionForm;