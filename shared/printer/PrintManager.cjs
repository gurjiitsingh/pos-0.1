const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const outletRepo = require('../../electron/db/outletRepo.cjs');
const {
  BillImageFormatter80,
} = require('./formatters/BillImageFormatter80.cjs');

const {
  ReportFormatter,
} = require('./formatters/ReportFormatter.cjs');

const {
  PrinterSettingsRepository,
} = require('./PrinterSettingsRepository.cjs');

const {
  FormatterFactory,
} = require('./formatters/FormatterFactory.cjs');

const {
  TransportFactory,
} = require('./transports/TransportFactory.cjs');

const {
  PrinterRole,
  ReceiptRenderMode,
} = require('./types.ts');

class PrintManager {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.settingsRepo = new PrinterSettingsRepository();
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  async enqueue(role, data, source = 'POS') {
    const jobId = crypto.randomUUID();

    const job = {
      id: jobId,
      role,
      data,
      createdAt: Date.now(),
      source,
    };

    this.queue.push(job);

    // start background processing
    this.processQueue().catch((e) => {
      console.error('Queue processing failed', e);
    });

    return jobId;
  }

  getQueueLength() {
    return this.queue.length;
  }

  // =====================================================
  // INTERNAL QUEUE PROCESSOR
  // =====================================================

  async processQueue() {
    if (this.processing) return;

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const job = this.queue.shift();

        if (!job) continue;

        await this.handleJob(job);
      }
    } finally {
      this.processing = false;
    }
  }

  // =====================================================
  // JOB HANDLER
  // =====================================================








async handleJob(job) {

    console.log('[PRINT JOB] Started:', {
        id: job.id,
        role: job.role,
        source: job.source,
    });

    // REPORT uses BILL printer settings, but keeps REPORT formatting.
    const printerRole =
        job.role === 'REPORT' ? PrinterRole.BILL : job.role;

    const config = this.settingsRepo.getConfig(printerRole);

    console.log('[PRINT JOB] Printer config:', {
        requestedRole: job.role,
        printerRole,
        configFound: Boolean(config),
        active: config?.active,
        connectionType: config?.connectionType,
        printerName: config?.printerName,
        renderMode: config?.renderMode,
        paperSize: config?.paperSize,
    });

    if (!config) {
        throw new Error(
            `Printer configuration not found for role ${printerRole}`
        );
    }

    if (config.connectionType === 'USB') {
        console.log('[PRINT JOB] USB target printer:', config.printerName);
    }

    // =====================================================
    // TEXT PRINTING
    // =====================================================
    if (config.renderMode === ReceiptRenderMode.TEXT) {
      console.log('[PRINT JOB] Creating formatter:', job.role);

      const formatter = FormatterFactory.create(
        job.role,
        config.paperSize
      );

      console.log('[PRINT JOB] Formatter created:', {
        formatter: formatter?.constructor?.name,
      });

      const outletInfo =
        job.data?.outletInfo || outletRepo.getOutlet() || {};

      const printData = {
        ...job.data,
        outletInfo,
      };

      console.log('[PRINT JOB] Formatting data:', {
        role: job.role,
        reportTitle: printData.reportTitle,
        businessDate: printData.businessDate,
      });

      const output = formatter.format(
        printData,
        config.paperSize
      );

      if (typeof output !== 'string' || !output.trim()) {
        throw new Error(
          `Formatter returned empty text for role ${job.role}`
        );
      }

      console.log('[PRINT JOB] Formatted output:', {
        length: output.length,
        preview: output.slice(0, 300),
      });

      const transport = TransportFactory.create(config);

      console.log('[PRINT JOB] Transport created:', {
        transport: transport?.constructor?.name,
      });

      const ok = await transport.printText(config, output);

      console.log('[PRINT JOB] Transport result:', {
        role: job.role,
        ok,
      });

      if (!ok) {
        throw new Error(
          `Text printing failed for role ${job.role}`
        );
      }

      console.log('[PRINT JOB] Completed:', {
        role: job.role,
        id: job.id,
      });

      return;
    }

    // =====================================================
    // IMAGE PRINTING
    // =====================================================
    if (config.renderMode === ReceiptRenderMode.IMAGE) {
      throw new Error(
        `Image printing is not implemented for role ${job.role}`
      );
    }

    throw new Error(
      `Unsupported render mode: ${config.renderMode}`
    );
  }




  // =====================================================
  // BILL IMAGE PREVIEW
  // =====================================================
  //
  // Generates the SAME PNG receipt as IMAGE mode,
  // but does NOT send anything to a printer.
  //
  // This is only for development/testing when
  // a thermal printer is not available.
  //
  async previewBillImage(data) {
    console.log(
      '\n========== BILL IMAGE PREVIEW =========='
    );

    try {
      console.log(
        '[PREVIEW] Generating bill image...'
      );

      const formatter =
        new BillImageFormatter80();

      const pngBuffer =
        await formatter.format(data);

      const previewDir =
        path.join(
          process.cwd(),
          'print-previews'
        );

      // Create directory if it does not exist
      if (!fs.existsSync(previewDir)) {
        fs.mkdirSync(
          previewDir,
          {
            recursive: true,
          }
        );
      }

      const fileName =
        `bill-${Date.now()}.png`;

      const filePath =
        path.join(
          previewDir,
          fileName
        );

      fs.writeFileSync(
        filePath,
        pngBuffer
      );

      console.log(
        '[PREVIEW] PNG created:',
        filePath
      );

      return {
        success: true,
        filePath,
        fileName,
      };

    } catch (error) {

      console.error(
        '[PREVIEW] BILL IMAGE ERROR:',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          'Failed to generate bill image',
      };
    }
  }
  // =====================================================
  // CONVENIENCE METHODS
  // =====================================================

  async enqueueKitchen(data) {
    return this.enqueue(PrinterRole.KITCHEN, data);
  }

  async enqueueBill(data) {
    return this.enqueue(PrinterRole.BILL, data);
  }

  async enqueueBar(data) {
    return this.enqueue(PrinterRole.BAR, data);
  }
}

// Singleton instance
const printManager = new PrintManager();

module.exports = {
  PrintManager,
  printManager,
};