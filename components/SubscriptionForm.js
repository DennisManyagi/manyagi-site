const SubscriptionForm = ({ formId, uid, title, description }) => {
  return (
    <div aria-labelledby="form-title">
      <h3 id="form-title">{title}</h3>
      <p className="text-muted text-sm mb-4">{description}</p>
      <script async src="https://f.convertkit.com/ckjs/ck.5.js"></script>
      <form action={`https://app.kit.com/forms/${formId}/subscriptions`} className="seva-form formkit-form" method="post" data-sv-form={formId} data-uid={uid} data-format="inline" data-version="5">
        <div className="formkit-field mb-4">
          <label htmlFor="name" className="sr-only">First Name</label>
          <input id="name" className="formkit-input w-full p-3 border border-line rounded" name="fields[first_name]" placeholder="First Name" type="text" />
        </div>
        <div className="formkit-field mb-4">
          <label htmlFor="email" className="sr-only">Email Address</label>
          <input id="email" className="formkit-input w-full p-3 border border-line rounded" name="email_address" placeholder="Email Address" required type="email" />
        </div>
        <button className="formkit-submit btn w-full" type="submit">Subscribe</button>
      </form>
    </div>
  );
};

export default SubscriptionForm;