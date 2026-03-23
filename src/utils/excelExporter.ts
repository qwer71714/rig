import ExcelJS from 'exceljs';
import { CrawlResult } from '../types';

export class ExcelExporter {
  async export(data: CrawlResult, filePath: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'App Store Crawler';
    workbook.created = new Date();

    this.createAppInfoSheet(workbook, data);
    this.createReviewsSheet(workbook, data);

    await workbook.xlsx.writeFile(filePath);
  }

  private createAppInfoSheet(workbook: ExcelJS.Workbook, data: CrawlResult): void {
    const sheet = workbook.addWorksheet('앱 정보');

    sheet.columns = [
      { header: '항목', key: 'field', width: 20 },
      { header: '내용', key: 'value', width: 60 },
    ];

    this.styleHeader(sheet);

    const info = data.appInfo;
    const rows = [
      { field: '앱 이름', value: info.title },
      { field: '개발자', value: info.developer },
      { field: '평점', value: `${info.rating} / 5.0` },
      { field: '평가 수', value: info.ratingCount.toLocaleString() },
      { field: '가격', value: info.price },
      { field: '카테고리', value: info.genre },
      { field: '버전', value: info.version },
      { field: '스토어', value: info.storeType === 'appstore' ? 'App Store' : 'Google Play' },
      { field: 'URL', value: info.url },
      { field: '최종 업데이트', value: info.lastUpdated },
      { field: '리뷰 수집 수', value: `${data.reviews.length}건` },
      { field: '수집 일시', value: data.crawledAt },
      { field: '앱 설명', value: info.description },
    ];

    rows.forEach((row) => sheet.addRow(row));
  }

  private createReviewsSheet(workbook: ExcelJS.Workbook, data: CrawlResult): void {
    const sheet = workbook.addWorksheet('리뷰');

    sheet.columns = [
      { header: 'No.', key: 'no', width: 8 },
      { header: '작성자', key: 'userName', width: 18 },
      { header: '별점', key: 'rating', width: 8 },
      { header: '제목', key: 'title', width: 30 },
      { header: '내용', key: 'text', width: 60 },
      { header: '작성일', key: 'date', width: 15 },
    ];

    this.styleHeader(sheet);

    data.reviews.forEach((review, index) => {
      sheet.addRow({
        no: index + 1,
        userName: review.userName,
        rating: '★'.repeat(review.rating) + '☆'.repeat(Math.max(0, 5 - review.rating)),
        title: review.title,
        text: review.text,
        date: review.date,
      });
    });

    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: data.reviews.length + 1, column: 6 },
    };
  }

  private styleHeader(sheet: ExcelJS.Worksheet): void {
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 28;
  }
}
