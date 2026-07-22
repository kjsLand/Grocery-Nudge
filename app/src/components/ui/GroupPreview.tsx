interface Preview {
  imageUrl: string;
  name: string;
  clickPath: () => void;
}

export default function GroupPreview({ imageUrl, name, clickPath }: Preview) {
  return (
    <div
      className="group-preview"
      onClick={clickPath}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          clickPath();
        }
      }}
    >
      <img src={imageUrl} alt={name} className="group-preview__image" />
      <p className="group-preview__name">{name}</p>

      <style jsx>{`
        .group-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          width: 5rem;
          cursor: pointer;
        }

        .group-preview:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 4px;
          border-radius: 12px;
        }

        .group-preview__image {
          width: 5rem;
          height: 5rem;
          object-fit: cover;
          border-radius: 12px;
        }

        .group-preview__name {
          margin: 0;
          font-size: 0.85rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}