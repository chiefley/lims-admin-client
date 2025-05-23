Key Workflow:

Login → User authenticates and labs are fetched automatically
Context Establishment → Default lab becomes current context
Lab Switching → Users can switch between available labs via the LabSelector
API Calls → All subsequent API calls automatically use the current lab context
Context Validation → Services validate context before making API calls
