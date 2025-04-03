
public class CompoundRs
{
    // Primary Key, no display.
    public int AnalyteId { get; set; }

    // @validation:  Must be unique.
    [Required]
    [StringLength(50)] 
    public string Cas { get; set; }

    [Required]
    [StringLength(150)] 
    public string Name { get; set; }

    [StringLength(150)] 
    public string CcCompoundName { get; set; }
}