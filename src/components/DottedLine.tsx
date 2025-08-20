export const DottedLine = () => {
  return (
    <span
      className="flex-grow mx-2 h-2 mt-3 "
      style={{
        backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)',
        backgroundSize: '10px 10px',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat-x',
      }}
      aria-hidden="true"
    ></span>
  );
};
