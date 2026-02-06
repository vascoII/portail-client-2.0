namespace Techem.Webservices.WS_EspaceClient.Reports
{
    public partial class XtraReport_NoData : DevExpress.XtraReports.UI.XtraReport
    {
        public XtraReport_NoData()
        {
            InitializeComponent();
        }

        public void Init(string titre, string detail)
        {
            xrLabelTitre.Text = titre;
            xrLabelDetail.Text = detail;
        }

    }
}
