import { SUPPORT_EMAIL } from '@/utils/constants';

const Privacy = () => {
  return (
    <div className="container mx-auto px-4   py-8 space-y-4">
      <p>
        This website is owned and operated by YEEZY LLC. We respect your privacy
        and understand that you have a right to know why we collect your
        personal information and what we do with it. This Privacy Policy applies
        to information we collect through our Website (as defined below) as well
        as information we may collect offline.
      </p>

      <p>
        This policy describes the type of information we collect from you and/or
        that you may provide us when you visit and/or use this or related
        websites, any of our mobile applications, and any related services
        (individually or collectively, “Website”). “You/your/user(s)” means you
        as a user of our Website.
      </p>

      <p>
        By accessing the Website, you acknowledge this Privacy Policy and agree
        to be bound by the terms hereof, the Website Terms and Conditions, and
        any other terms or policies we post on the Website. If there is anything
        you do not understand, please email any inquiry to{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. If at any time
        you do not agree to this Privacy Policy, please do not use the Website
        or provide us with any Personal Information.
      </p>

      <p>
        We reserve the right to change or update this Privacy Policy by posting
        such changes or updates to the Website or emailing you notice of the
        changes. Amendments to this Privacy Policy will be posted at this URL
        and will be effective when posted. You can tell if this Privacy Policy
        has changed by checking the last modified date that appears at the end
        of this Privacy Policy. Your continued use of the Website following the
        posting of any amendment, modification or change shall constitute your
        acceptance thereof.
      </p>

      <h2>YOUR SECURITY</h2>
      <p>
        We strive to keep your Personal Information private and safe. We take
        commercially reasonable physical, electronic and administrative steps to
        maintain the security of Personal Information collected, including
        limiting the number of people who have physical access to database
        servers, as well as employing electronic security systems and password
        protections that guard against unauthorized access.
      </p>

      <p>
        Unfortunately, despite our best efforts, the transmission of data over
        the Internet cannot be guaranteed to be 100% secure. While we will use
        reasonable means to ensure the security of information you transmit
        through the Website, any transmission of Personal Information is at your
        own risk.
      </p>

      <h2>INFORMATION WE COLLECT</h2>
      <h3>Personal Information You Provide to Us</h3>
      <p>
        The Personal Information you provide to us includes, by way of example:
      </p>
      <ul>
        <li>
          Contact details including name, email, telephone number, and shipping,
          billing address
        </li>
        <li>Login and account information</li>
        <li>Personal details and purchase history</li>
        <li>
          Personal preferences including your wish list as well as marketing
          preferences
        </li>
        <li>Purchase history</li>
        <li>
          Payment or credit card information through our third-party payment
          processor
        </li>
      </ul>

      <h3>Automated Information</h3>
      <p>
        We also collect information, some of which may be Personal Information,
        through automated means when you visit our Website (“Automated
        Information”) such as:
      </p>
      <ul>
        <li>IP address of your device</li>
        <li>Browser and device characteristics</li>
        <li>Operating system</li>
        <li>Language preferences</li>
        <li>Websites visited before coming to our Website</li>
        <li>Actions taken on our Website</li>
        <li>Dates and times of visits</li>
      </ul>

      <h2>HOW WE USE YOUR PERSONAL INFORMATION</h2>
      <p>
        We do not engage in automated decision-making. We may use Personal
        Information to better understand who uses the Website and how we can
        deliver a better user experience. We use your Personal Information for
        purposes such as:
      </p>
      <ul>
        <li>To fulfill product orders</li>
        <li>To communicate with you about your order</li>
        <li>To provide you with promotional offers</li>
        <li>To detect security incidents</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2>SHARING PERSONAL INFORMATION WITH THIRD PARTIES</h2>
      <p>
        We do not sell your Personal Information to third parties. However, we
        may share your information with:
      </p>
      <ul>
        <li>Our affiliates</li>
        <li>
          Third parties that assist in fulfilling orders and operating our
          Website
        </li>
        <li>Law enforcement agencies when required by law</li>
      </ul>

      <h2>TARGETED ADVERTISING AND REMARKETING</h2>
      <p>
        You may see advertisements for our products/services on other websites
        because we work with third-party advertisers to engage in remarketing
        and retargeting activities.
      </p>

      <h2>OTHER WEBSITES</h2>
      <p>
        Our Website may contain links or references to websites operated by
        third parties. These websites operate independently from us, and we have
        no control over their privacy practices.
      </p>

      <h2>YOUR CHOICES ABOUT HOW WE USE YOUR INFORMATION AND OPTING OUT</h2>
      <p>
        You can choose whether or not to provide Personal Information through
        the Website. You may opt-out of targeted advertising or promotional
        emails by following the instructions provided in emails we send.
      </p>

      <h2>DISCLOSURE FOR LEGAL PURPOSES</h2>
      <p>
        We may disclose your Personal Information pursuant to judicial
        proceedings and to law enforcement or government agencies if legally
        required.
      </p>

      <h2>NOTICE TO CALIFORNIA CONSUMERS</h2>
      <p>
        California residents have specific rights under the CCPA/CPRA, including
        the right to access, delete, and restrict the use of their Personal
        Information.
      </p>

      <h2>CONTACT</h2>
      <p>
        If you have any questions about your privacy or security at the Website,
        or wish to update your Personal Information, please send an email to{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </div>
  );
};

export default Privacy;
