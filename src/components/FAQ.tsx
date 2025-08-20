import { qanda } from '@/utils/qanda';
import { useRef, useState } from 'react';
import styles from '@/styles/qanda.module.css';
import { cn } from '@/lib/utils';

export const FAQ = () => {
  return (
    <div className="space-y-8">
      <p className=" ">FREQUENTLY ASKED QUESTIONS</p>
      <div>
        {qanda.map(({ question }, index) => (
          <Dropdown
            key={index}
            question={question}
            answer={qanda[index].answer}
          />
        ))}
      </div>
    </div>
  );
};

const Dropdown = ({
  question,
  answer,
  className,
}: {
  question: string;
  answer: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  const [wrapperHeight, setWH] = useState(0);

  const showHide = () => {
    if (ref.current) {
      if (isOpen) {
        setWH(0);
      } else {
        setWH(ref.current.offsetHeight);
      }
    }
    setIsOpen(!isOpen);
  };

  // WARNING CA SHOULD NEVER BE ALL CAPS

  return (
    <div className={cn(`mx-auto space-y-4 text-left`, className)}>
      <button onClick={showHide} className="normal-case">
        <p className="uppercase text-left">{question}</p>
      </button>
      <div
        style={{ height: wrapperHeight, overflowY: 'hidden' }}
        className="transition-all break-words"
        suppressHydrationWarning
      >
        <div
          suppressHydrationWarning
          ref={ref}
          dangerouslySetInnerHTML={{ __html: answer }}
          className={cn(styles['custom-text'], 'pb-4 text-black/20')}
        ></div>
      </div>
    </div>
  );
};
