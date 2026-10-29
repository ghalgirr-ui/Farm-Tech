function Card({ children, className = "", ...props }) {
  return (
    <article className={`info-card ${className}`.trim()} {...props}>
      {children}
    </article>
  );
}

export default Card;
