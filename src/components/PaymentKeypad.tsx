import React from "react";

interface PaymentKeypadProps {
  onNumberClick: (num: string) => void;
  onBackspace: () => void;
}

export function PaymentKeypad({
  onNumberClick,
  onBackspace,
}: PaymentKeypadProps) {
  const keys = [..."123456789.0<"];
  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-6 xl:gap-8 w-[90%] mx-auto">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => {
            if (key === "<") {
              onBackspace();
            } else {
              onNumberClick(key);
            }
          }}
          className="text-center text-2xl hover:opacity-70"
        >
          {key}
        </button>
      ))}
    </div>
  );
}
