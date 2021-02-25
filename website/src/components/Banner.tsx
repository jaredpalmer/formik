import { ExternalLink } from './ExternalLink';

export function Banner() {
  return (
    <div className="bg-gray-900  text-center  py-2 px-4">
      <ExternalLink
        href="https://formium.io?utm_source=formik&utm_medium=announcement"
        className=" p-2 sm:bg-gray-800 items-center text-gray-100 leading-none sm:rounded-full flex sm:inline-flex betterhover:hover:bg-gray-700 transition duration-150 ease-in-out"
        role="alert"
      >
        <span className="flex rounded-full bg-gradient-to-r from-teal-400 to-blue-500 uppercase px-2 py-1 text-xs font-bold mr-3 leading-none">
          New
        </span>
        <span className="font-bold mr-2 text-left flex-auto text-sm leading-4">
          Announcing Formium!{' '}
          <span className="font-normal">
            A headless form builder from the makers of Formik.
          </span>
        </span>
        <svg
          className="fill-current opacity-75 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
        </svg>
      </ExternalLink>
    </div>
  );
}
