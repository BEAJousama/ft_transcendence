import Avatar from "../avatar";
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
    <div className="flex -space-x-4">
      {array && array}
      {rest && rest.length && (
        <a
          className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800"
          href="#"
        >
          +{rest.length}
        </a>
      )}
    </div>
  );
};

export default AvatarGroup;
