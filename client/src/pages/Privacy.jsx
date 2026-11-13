import ContentPage from '../components/ContentPage';
import usePageTitle from '../hooks/usePageTitle';

const SECTIONS = [
  ['Information we collect', 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.'],
  ['How we use your information', 'We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.'],
  ['Information sharing', 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.'],
  ['Data security', 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'],
];

const Privacy = () => {
  usePageTitle('Privacy policy');
  return (
    <ContentPage title="Privacy policy" description="Last updated: December 2024" width="max-w-3xl">
      <div className="prose-copy">
        {SECTIONS.map(([heading, body]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{body}</p>
          </section>
        ))}
        <section>
          <h2>Contact us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@houseofhomegrown.com">hello@houseofhomegrown.com</a>.</p>
        </section>
      </div>
    </ContentPage>
  );
};

export default Privacy;
