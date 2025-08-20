import Link from 'next/link';

export const Terms = () => {
  return (
    <div>
      <div className="mx-auto uppercase space-y-4 text-black/20 text-xs">
        <p>
          YZY Coins are intended to function as an expression of support for and
          engagement with the ideals and beliefs embodied by the symbol
          &quot;YZY&quot; and the associated artwork and are not intended to be
          or to be the subject of an investment opportunity investment contract
          or security of any type
        </p>
        <p>
          YZY is not available to persons or entities in restricted
          jurisdictions
        </p>

        <p>
          Users acknowledge that digital assets involve inherent risks and
          potential for complete loss
        </p>

        <p>
          Nothing on this site constitutes financial legal or investment advice
        </p>
        <p>
          See terms and conditions <Link href="/terms">here</Link>
        </p>
        <p>YEEZY OVER EVERYTHING</p>
      </div>
    </div>
  );
};
