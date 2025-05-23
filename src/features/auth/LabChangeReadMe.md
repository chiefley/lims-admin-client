Implementation Steps:

Add the hook to existing management pages:

typescript// Just add this one line to any admin component
const { currentLabId, currentLabName } = useLabChangeRedirect();

Dashboard stays put and refreshes data:

typescript// Dashboard disables redirect and handles lab changes itself
const { currentLabId } = useLabChangeRedirect({ enableRedirect: false });

Special pages can opt out if needed:

typescript// For pages like login, debug, etc.
const { currentLabId } = useLabChangeRedirect({ enableRedirect: false });
