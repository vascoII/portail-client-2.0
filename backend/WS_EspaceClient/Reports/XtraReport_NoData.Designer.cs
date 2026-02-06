namespace Techem.Webservices.WS_EspaceClient.Reports
{
    partial class XtraReport_NoData
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary> 
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(XtraReport_NoData));
            this.Detail = new DevExpress.XtraReports.UI.DetailBand();
            this.ReportHeader = new DevExpress.XtraReports.UI.ReportHeaderBand();
            this.xrLabelDetail = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelTitre = new DevExpress.XtraReports.UI.XRLabel();
            this.xrPictureBox1 = new DevExpress.XtraReports.UI.XRPictureBox();
            this.xrPictureBox9 = new DevExpress.XtraReports.UI.XRPictureBox();
            this.topMarginBand1 = new DevExpress.XtraReports.UI.TopMarginBand();
            this.bottomMarginBand1 = new DevExpress.XtraReports.UI.BottomMarginBand();
            ((System.ComponentModel.ISupportInitialize)(this)).BeginInit();
            // 
            // Detail
            // 
            this.Detail.HeightF = 100F;
            this.Detail.Name = "Detail";
            this.Detail.Padding = new DevExpress.XtraPrinting.PaddingInfo(0, 0, 0, 0, 100F);
            this.Detail.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopLeft;
            // 
            // ReportHeader
            // 
            this.ReportHeader.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrLabelDetail,
            this.xrLabelTitre,
            this.xrPictureBox1,
            this.xrPictureBox9});
            this.ReportHeader.HeightF = 124F;
            this.ReportHeader.Name = "ReportHeader";
            // 
            // xrLabelDetail
            // 
            this.xrLabelDetail.Font = new System.Drawing.Font("Times New Roman", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.xrLabelDetail.LocationFloat = new DevExpress.Utils.PointFloat(192F, 75F);
            this.xrLabelDetail.Name = "xrLabelDetail";
            this.xrLabelDetail.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelDetail.SizeF = new System.Drawing.SizeF(608F, 25F);
            this.xrLabelDetail.StylePriority.UseFont = false;
            this.xrLabelDetail.Text = "xrLabelDetail";
            // 
            // xrLabelTitre
            // 
            this.xrLabelTitre.Font = new System.Drawing.Font("Times New Roman", 14.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.xrLabelTitre.LocationFloat = new DevExpress.Utils.PointFloat(192F, 8F);
            this.xrLabelTitre.Name = "xrLabelTitre";
            this.xrLabelTitre.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelTitre.SizeF = new System.Drawing.SizeF(608F, 50F);
            this.xrLabelTitre.StylePriority.UseFont = false;
            this.xrLabelTitre.StylePriority.UseTextAlignment = false;
            this.xrLabelTitre.Text = "xrLabelTitre";
            this.xrLabelTitre.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // xrPictureBox1
            // 
            this.xrPictureBox1.Image = ((System.Drawing.Image)(resources.GetObject("xrPictureBox1.Image")));
            this.xrPictureBox1.LocationFloat = new DevExpress.Utils.PointFloat(58F, 8F);
            this.xrPictureBox1.Name = "xrPictureBox1";
            this.xrPictureBox1.SizeF = new System.Drawing.SizeF(117F, 50F);
            this.xrPictureBox1.Sizing = DevExpress.XtraPrinting.ImageSizeMode.ZoomImage;
            // 
            // xrPictureBox9
            // 
            this.xrPictureBox9.Image = ((System.Drawing.Image)(resources.GetObject("xrPictureBox9.Image")));
            this.xrPictureBox9.LocationFloat = new DevExpress.Utils.PointFloat(8F, 8F);
            this.xrPictureBox9.Name = "xrPictureBox9";
            this.xrPictureBox9.SizeF = new System.Drawing.SizeF(25F, 108F);
            this.xrPictureBox9.Sizing = DevExpress.XtraPrinting.ImageSizeMode.ZoomImage;
            // 
            // topMarginBand1
            // 
            this.topMarginBand1.HeightF = 10F;
            this.topMarginBand1.Name = "topMarginBand1";
            // 
            // bottomMarginBand1
            // 
            this.bottomMarginBand1.HeightF = 10F;
            this.bottomMarginBand1.Name = "bottomMarginBand1";
            // 
            // XtraReport_NoData
            // 
            this.Bands.AddRange(new DevExpress.XtraReports.UI.Band[] {
            this.Detail,
            this.ReportHeader,
            this.topMarginBand1,
            this.bottomMarginBand1});
            this.Margins = new System.Drawing.Printing.Margins(10, 10, 10, 10);
            this.PageHeight = 1169;
            this.PageWidth = 827;
            this.PaperKind = System.Drawing.Printing.PaperKind.A4;
            this.Version = "17.1";
            ((System.ComponentModel.ISupportInitialize)(this)).EndInit();

        }

        #endregion

        private DevExpress.XtraReports.UI.DetailBand Detail;
        private DevExpress.XtraReports.UI.ReportHeaderBand ReportHeader;
        private DevExpress.XtraReports.UI.XRPictureBox xrPictureBox1;
        private DevExpress.XtraReports.UI.XRPictureBox xrPictureBox9;
        private DevExpress.XtraReports.UI.XRLabel xrLabelDetail;
        private DevExpress.XtraReports.UI.XRLabel xrLabelTitre;
        private DevExpress.XtraReports.UI.TopMarginBand topMarginBand1;
        private DevExpress.XtraReports.UI.BottomMarginBand bottomMarginBand1;
    }
}
