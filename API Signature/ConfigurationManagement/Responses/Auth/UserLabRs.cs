namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Auth;

// This is an advanced selector.  No Edit
public partial class UserLabRs
{
    public int UserLabId { get; set; }
    public int UserId { get; set; }
    public int LabId { get; set; }
    public string LabName { get; set; }
    public int  StateId { get; set; }
    public string StateAbbreviation { get; set; }
    public bool IsDefaultLab { get; set; }

}