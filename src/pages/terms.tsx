import { PUBLIC_URL, PUBLIC_URL_HOST, SUPPORT_EMAIL } from '@/utils/constants';
import Link from 'next/link';

const Terms = () => {
  return (
    <div className="container mx-auto px-4   py-8 space-y-4">
      <h1>TERMS</h1>
      <p>Yeezy Investments LLC operates this website under license rights granted by Ox Paha Inc.</p>
      
      <p>
        The website located at <a href={PUBLIC_URL}>{PUBLIC_URL_HOST}</a> (the
        “Website”) is the intellectual property of Yeezy Investments LLC (hereinafter
        collectively referred to as “we” “our” or “us”). The following Terms and
        Conditions also incorporate by reference our Privacy Policy, and any and
        all other applicable operating rules, policies, schedules and other
        terms and conditions or documents that may be published from time to
        time (collectively, the “Terms and Conditions” or this “Agreement”). Our
        Website, together with any content, functionality, and services offered
        on or through our Website, and all of the existing and any updated or
        new content, features, functionalities, materials, social media pages,
        shall be collectively referred to as the “Services.”
      </p>

      <p>
        These Terms and Conditions explain the terms and conditions by which you
        may access and use the Services provided by us. Please review these
        Terms and Conditions carefully before accessing the Website or any of
        the Services. The Terms and Conditions supersede all prior or
        contemporaneous agreements, representations, warranties and/or
        understandings with respect to your use of the Services. If you do not
        agree to the Terms and Conditions in its entirety, you should not use
        the Website or any of the Services in any manner or form whatsoever.
      </p>

      <p>
        THIS AGREEMENT CONTAINS DISCLAIMERS OF WARRANTIES, LIMITATIONS OF
        LIABILITY, RELEASES, CLASS-ACTION WAIVER, AND THE REQUIREMENT TO
        ARBITRATE ANY AND ALL CLAIMS THAT MAY ARISE HEREUNDER AGAINST Yeezy Investments LLC,
        ITS AFFILIATES, MANAGERS, MEMBERS, SERVICE PROVIDERS, PARTNERS,
        ADVISORS, AND VENDORS (COLLECTIVELY, “COVERED PARTIES”), WHO ARE THE
        EXPRESS THIRD-PARTY BENEFICIARIES OF THE MANDATORY ARBITRATION
        PROVISION. THE AFOREMENTIONED PROVISIONS ARE AN ESSENTIAL BASIS OF THIS
        AGREEMENT.
      </p>

      <p>
        You agree to the Terms and Conditions in its entirety when you: (a)
        access or use the Website; (b) access and/or view any of the: (i) links
        to third-party resources and other information (“Third-Party Links”)
        through the Website; and/or (ii) videos, audio, stories, testimonials,
        text, photographs, graphics, artwork, information and/or other content
        that may be featured on the Website (the “Website Content,“ and together
        with the Third-Party Links, the “Content“); (d) purchase any of the
        Solana blockchain-based fungible cryptographic assets known as “YZY” featured on the Website (the “YZY”); and/or (e)
        utilize the various registration forms, contact forms and/or contact
        information made available on the Website.
      </p>

      <p>
        THE YZY ARE INTENDED TO FUNCTION AS AN EXPRESSION OF SUPPORT FOR,
        AND ENGAGEMENT WITH, THE IDEALS AND BELIEFS EMBODIED BY THE SYMBOL
        “$YZY” AND THE ASSOCIATED ARTWORK (THE “ARTWORK”) AND ARE NOT INTENDED
        TO BE, OR TO BE THE SUBJECT OF, AN INVESTMENT OPPORTUNITY, INVESTMENT
        CONTRACT, OR SECURITY OF ANY TYPE.
      </p>

      <p>
        <strong>Requirements.</strong>
      </p>

      <p>
        <strong>General.</strong> The Services are available only to individuals
        who can enter into legally binding contracts under applicable law. The
        Services are not intended for use by individuals under eighteen (18)
        years of age (or the applicable age of majority, if greater than
        eighteen (18) years of age in their respective jurisdictions). If you
        are under eighteen (18) years of age (or the applicable age of majority,
        if greater than eighteen (18) years of age in your jurisdiction) and/or
        if you are unable to enter into legally binding contracts and/or you are
        a Prohibited Party (defined below) you do not have permission to use
        and/or access the Services, and we may terminate your access to the
        Services at any time and for any reason in our sole discretion. In the
        case where you are an entity, you can only access the Services if you
        are duly incorporated, validly existing and in good standing under the
        laws of the jurisdiction of your incorporation.
      </p>

      <p>
        <strong>Prohibited Users.</strong> The Services are not available to (i)
        individuals or entities (including those owned or controlled by
        individuals) that are the subject of economic or trade sanctions
        administered or enforced by any governmental authority or otherwise
        designated on any list of prohibited or restricted parties (including
        but not limited to the United Nations Security Council, the European
        Union, His Majesty’s Treasury of the United Kingdom of Great Britain and
        Northern Ireland (the “UK Treasury”), and the U.S. Department of
        Treasury); (ii) individuals or entities placed on the “Denied Persons
        List” by the Bureau of Industry and Security of the United States
        Department of Commerce; or (iii) residents and citizens or entities
        located in or incorporated under the laws of any country, territory or
        other jurisdiction subject to a U.S. Government embargo, or that have
        been designated by the U.S. Government as a terrorist-supporting
        country, or is otherwise the subject of comprehensive country-wide,
        territory-wide, or regional economic sanctions by the United Nations,
        the European Union, the UK Treasury, or the United States, including
        without limitation Cuba, the Crimea, Donetsk, and Luhansk regions of
        Ukraine, Iran, North Korea, Russia, Syria, or Yemen (collectively,
        “Prohibited Users”).
      </p>

      <p>
        <strong>Privacy Policy.</strong> All comments, information, Registration
        Data and/or materials that you submit through or in association with the
        Services shall be subject to our Privacy Policy, which is hereby
        incorporated by reference. For a copy of the Privacy Policy, please{' '}
        <Link href="/privacy">click here</Link>.
      </p>

      <p>
        <strong>Contact Us.</strong> If you have any questions about the Terms
        and Conditions or the practices of{' '}
        <a href={PUBLIC_URL}>{PUBLIC_URL_HOST}</a>, please feel free to e-mail
        us at: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </div>
  );
};

export default Terms;
