import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface BizConnectRecord {
  userName: string;
  business?: string;
  invitedName: string;
  telephone?: string;
  email?: string;
  contactRelation?: string;
  status?: string;
  date: string;
  comments?: string;
}

interface BizWinRecord {
  userName: string;
  business?: string;
  amount: number;
  comments?: string;
  date: string;
}

interface MeetupRecord {
  title: string;
  organizer: string;
  date: string;
  time: string;
  place: string;
  attendees: number;
  agenda?: string;
}

interface VisitorInvitationRecord {
  meetingTitle: string;
  visitorName: string;
  email?: string;
  mobile?: string;
  businessCategory?: string;
  invitedBy: string;
  date: string;
}

export class DashboardPDFGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  }

  // Common header for all reports
  private addHeader(title: string, dateRange: { start: string; end: string }) {
    // Add logo/company name
    this.doc.setFontSize(20);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(33, 89, 255); // Blue color
    this.doc.text("BizCivitas", 15, 15);

    // Add report title
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, 15, 30);

    // Add date range
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(
      `Report Period: ${dateRange.start} to ${dateRange.end}`,
      15,
      38
    );

    // Add generation date
    this.doc.text(
      `Generated on: ${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      15,
      44
    );

    // Add horizontal line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(15, 48, 195, 48);
  }

  // BizConnect PDF Report
  generateBizConnectPDF(
    records: BizConnectRecord[],
    type: "given" | "received",
    dateRange: { start: string; end: string },
    totalCount: number
  ) {
    this.addHeader(
      `BizConnect Report - ${type === "given" ? "Given" : "Received"}`,
      dateRange
    );

    // Add summary
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`Total Records: ${totalCount}`, 15, 56);

    // Table headers
    const headers = [
      type === "given" ? "Referred To" : "Referred By",
      "Business",
      "Invited Person",
      "Contact",
      "Relation",
      "Status",
      "Date",
    ];

    // Table data
    const data = records.map((record) => [
      record.userName,
      record.business || "-",
      record.invitedName,
      record.telephone || record.email || "-",
      record.contactRelation || "-",
      record.status || "-",
      record.date,
    ]);

    autoTable(this.doc, {
      head: [headers],
      body: data,
      startY: 62,
      theme: "striped",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [74, 98, 173], // #4A62AD
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { left: 15, right: 15 },
    });

    // Add footer
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.doc.internal.pageSize.getWidth() / 2,
        this.doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    const filename = `BizConnect_${type}_${dateRange.start}_to_${dateRange.end}.pdf`;
    this.doc.save(filename);
  }

  // BizWin (TYFCB) PDF Report
  generateBizWinPDF(
    records: BizWinRecord[],
    type: "given" | "received",
    dateRange: { start: string; end: string },
    totalCount: number,
    totalAmount: number
  ) {
    this.addHeader(
      `BizWin Report (TYFCB) - ${type === "given" ? "Given" : "Received"}`,
      dateRange
    );

    // Add summary
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`Total Records: ${totalCount}`, 15, 56);
    this.doc.text(`Total Amount: Rs. ${this.formatCurrency(totalAmount)}`, 15, 63);

    // Table headers
    const headers = [
      type === "given" ? "Given To" : "Received From",
      "Business",
      "Amount (Rs.)",
      "Comments",
      "Date",
    ];

    // Table data
    const data = records.map((record) => [
      record.userName,
      record.business || "-",
      this.formatCurrency(record.amount),
      record.comments || "-",
      record.date,
    ]);

    autoTable(this.doc, {
      head: [headers],
      body: data,
      startY: 70,
      theme: "striped",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [74, 98, 173], // #4A62AD
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        2: { halign: "right" }, // Amount column right-aligned
      },
      margin: { left: 15, right: 15 },
    });

    // Add footer
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.doc.internal.pageSize.getWidth() / 2,
        this.doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    const filename = `BizWin_${type}_${dateRange.start}_to_${dateRange.end}.pdf`;
    this.doc.save(filename);
  }

  // Meetups PDF Report
  generateMeetupsPDF(
    records: MeetupRecord[],
    dateRange: { start: string; end: string },
    totalCount: number
  ) {
    this.addHeader("Meetups Report", dateRange);

    // Add summary
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`Total Meetups: ${totalCount}`, 15, 56);

    // Table headers
    const headers = [
      "Title",
      "Organized By",
      "Date",
      "Time",
      "Venue",
      "Attendees",
    ];

    // Table data
    const data = records.map((record) => [
      record.title,
      record.organizer,
      record.date,
      record.time,
      record.place,
      record.attendees.toString(),
    ]);

    autoTable(this.doc, {
      head: [headers],
      body: data,
      startY: 62,
      theme: "striped",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [74, 98, 173], // #4A62AD
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        5: { halign: "center" }, // Attendees column centered
      },
      margin: { left: 15, right: 15 },
    });

    // Add footer
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.doc.internal.pageSize.getWidth() / 2,
        this.doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    const filename = `Meetups_${dateRange.start}_to_${dateRange.end}.pdf`;
    this.doc.save(filename);
  }

  // Visitor Invitations PDF Report
  generateVisitorInvitationsPDF(
    records: VisitorInvitationRecord[],
    dateRange: { start: string; end: string },
    totalCount: number
  ) {
    this.addHeader("Visitor Invitations Report", dateRange);

    // Add summary
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`Total Invitations: ${totalCount}`, 15, 56);

    // Table headers
    const headers = [
      "Meeting",
      "Visitor Name",
      "Email",
      "Mobile",
      "Business",
      "Invited By",
      "Date",
    ];

    // Table data
    const data = records.map((record) => [
      record.meetingTitle,
      record.visitorName,
      record.email || "-",
      record.mobile || "-",
      record.businessCategory || "-",
      record.invitedBy,
      record.date,
    ]);

    autoTable(this.doc, {
      head: [headers],
      body: data,
      startY: 62,
      theme: "striped",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [74, 98, 173], // #4A62AD
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { left: 15, right: 15 },
    });

    // Add footer
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.doc.internal.pageSize.getWidth() / 2,
        this.doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    const filename = `Visitor_Invitations_${dateRange.start}_to_${dateRange.end}.pdf`;
    this.doc.save(filename);
  }

  // Helper function to format currency
  private formatCurrency(amount: number): string {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)} K`;
    } else {
      return amount.toFixed(2);
    }
  }
}
