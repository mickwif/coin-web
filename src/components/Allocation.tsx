export const Allocation = () => {
  return (
    <div className="space-y-8">
      <h3 className="">YZYNOMICS</h3>

      <div className="flex space-x-8">
        <div className="space-y-4 flex-1">
          <h4 className="h-12">PUBLIC</h4>
          <div className="flex  justify-between">
            <div>
              <p>PUBLIC</p>
              <p>SUPPLY</p>
            </div>
            <p>20%</p>
          </div>
          <div className="flex justify-between">
            <p>LIQUIDITY</p>
            <p>10%</p>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <h4 className="uppercase h-12">Yeezy Investments LLC</h4>
          <div className="flex   justify-between">
            <div>
              <p>3 MO. CLIFF,</p>
              <p>24 MO. VEST</p>
            </div>
            <p>30%</p>
          </div>
          <div className="flex   justify-between">
            <div>
              <p>6 MO. CLIFF,</p>
              <p>24 MO. VEST</p>
            </div>
            <p>20%</p>
          </div>
          <div className="flex justify-between">
            <div>
              <p>12 MO. CLIFF,</p>
              <p>24 MO. VEST</p>
            </div>
            <p>20%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
