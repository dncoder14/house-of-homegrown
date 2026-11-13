import ContentPage from '../components/ContentPage';
import usePageTitle from '../hooks/usePageTitle';

const SECTIONS = [
  ['Acceptance of terms', 'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.'],
  ['Use license', "Permission is granted to temporarily download one copy of the materials on House of Homegrown's website for personal, non-commercial transitory viewing only."],
  ['Product information', 'We strive to provide accurate product information, but we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.'],
  ['Orders and payment', 'All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason.'],
  ['Limitation of liability', 'House of Homegrown shall not be liable for any damages arising from the use or inability to use our products or services.'],
];

const Terms = () => {
  usePageTitle('Terms & conditions');
  return (
    <ContentPage title="Terms & conditions" description="Last updated: December 2024" width="max-w-3xl">
      <div className="prose-copy">
        {SECTIONS.map(([heading, body]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{body}</p>
          </section>
        ))}
        <section>
          <h2>Contact information</h2>
          <p>For questions about these Terms & Conditions, please contact us at <a href="mailto:hello@houseofhomegrown.com">hello@houseofhomegrown.com</a>.</p>
        </section>
      </div>
    </ContentPage>
  );
};

export default Terms;
