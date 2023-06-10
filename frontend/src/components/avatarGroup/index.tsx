import { Children } from "react";

const AvatarGroup = ({
  max,
  children,
}: {
  max: number;
  children: React.ReactNode;
}) => {
  const array = children ? Children.toArray(children).slice(0, max) : undefined;
  const rest = children ? Children.toArray(children).slice(max) : undefined;
  return (
    <div className="flex -space-x-3">
      {array && array}
      {rest && !!rest.length && (
        <a
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-700 text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800"
          href="/chat"
        >
          +{rest.length}
        </a>
      )}
    </div>
  );
};

export default AvatarGroup;
