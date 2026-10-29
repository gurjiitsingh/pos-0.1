
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class PrinterSettingsRepository {
  constructor() {
    this.filePath = path.join(
      app.getPath('userData'),
      'printers.json'
    );
  }

  // =====================================================
  // READ ALL PRINTER CONFIGURATIONS
  // =====================================================
  readAll() {
    if (!fs.existsSync(this.filePath)) {
      return [];
    }

    try {
      const raw = fs.readFileSync(
        this.filePath,
        'utf8'
      );

      const configs = JSON.parse(raw);

      return Array.isArray(configs)
        ? configs
        : [];
    } catch (error) {
      console.error(
        '[PRINTER SETTINGS] Failed to read printers.json:',
        error
      );

      return [];
    }
  }

  // =====================================================
  // NORMALIZE CONFIGURATION IDENTITY
  // =====================================================
  normalizeRole(role) {
    return String(role || '').trim().toUpperCase();
  }

  normalizeConnectionType(connectionType) {
    return String(connectionType || '')
      .trim()
      .toUpperCase();
  }

  // =====================================================
  // GET ALL CONFIGURATIONS FOR A ROLE
  // =====================================================
  getConfigsByRole(role) {
    const normalizedRole = this.normalizeRole(role);

    return this.readAll().filter(
      (printer) =>
        this.normalizeRole(printer.role) ===
        normalizedRole
    );
  }

  // =====================================================
  // GET CONFIGURATION FOR ROLE + CONNECTION
  // =====================================================
  getConfigByConnection(role, connectionType) {
    const normalizedRole = this.normalizeRole(role);
    const normalizedConnection =
      this.normalizeConnectionType(connectionType);

    return this.readAll().find(
      (printer) =>
        this.normalizeRole(printer.role) ===
          normalizedRole &&
        this.normalizeConnectionType(
          printer.connectionType
        ) === normalizedConnection
    ) || null;
  }

  // =====================================================
  // GET ACTIVE CONFIGURATION FOR A ROLE
  // =====================================================
  getConfig(role) {
    const configs = this.getConfigsByRole(role);

    const activeConfig = configs.find(
      (printer) => printer.active === true
    );

    if (activeConfig) {
      return activeConfig;
    }

    // Backward compatibility for old files that
    // contain one configuration per role.
    if (configs.length === 1) {
      return configs[0];
    }

    // Multiple saved connections with no active
    // selection must not silently choose the wrong one.
    return null;
  }

  // =====================================================
  // SAVE ONE CONFIGURATION
  // Keeps other connection types and roles intact.
  // =====================================================
  saveConfig(config) {
    if (!config || !config.role) {
      throw new Error(
        'Printer role is required'
      );
    }

    const normalizedRole =
      this.normalizeRole(config.role);

    const normalizedConnection =
      this.normalizeConnectionType(
        config.connectionType
      );

    if (!normalizedConnection) {
      throw new Error(
        'Printer connectionType is required'
      );
    }

    const all = this.readAll();

    const existing = all.find(
      (printer) =>
        this.normalizeRole(printer.role) ===
          normalizedRole &&
        this.normalizeConnectionType(
          printer.connectionType
        ) === normalizedConnection
    );

    const savedConfig = {
      ...(existing || {}),
      ...config,
      role: normalizedRole,
      connectionType: normalizedConnection,
      active:
  config.active === undefined
    ? existing?.active === true
    : config.active === true,
    };

    let updated = all.filter(
      (printer) =>
        !(
          this.normalizeRole(printer.role) ===
            normalizedRole &&
          this.normalizeConnectionType(
            printer.connectionType
          ) === normalizedConnection
        )
    );

    // One active connection per role.
    if (savedConfig.active) {
      updated = updated.map((printer) => {
        if (
          this.normalizeRole(printer.role) ===
          normalizedRole
        ) {
          return {
            ...printer,
            active: false,
          };
        }

        return printer;
      });
    }

    updated.push(savedConfig);

    this.saveAll(updated);

    return savedConfig;
  }

  // =====================================================
  // ACTIVATE AN EXISTING CONNECTION
  // =====================================================
  setActive(role, connectionType) {
    const normalizedRole = this.normalizeRole(role);
    const normalizedConnection =
      this.normalizeConnectionType(connectionType);

    const all = this.readAll();

    const target = all.find(
      (printer) =>
        this.normalizeRole(printer.role) ===
          normalizedRole &&
        this.normalizeConnectionType(
          printer.connectionType
        ) === normalizedConnection
    );

    if (!target) {
      throw new Error(
        `Printer configuration not found: ${normalizedRole} + ${normalizedConnection}`
      );
    }

    const updated = all.map((printer) => {
      if (
        this.normalizeRole(printer.role) ===
        normalizedRole
      ) {
        return {
          ...printer,
          active:
            this.normalizeConnectionType(
              printer.connectionType
            ) === normalizedConnection,
        };
      }

      return printer;
    });

    this.saveAll(updated);

    return updated.find(
      (printer) =>
        this.normalizeRole(printer.role) ===
          normalizedRole &&
        this.normalizeConnectionType(
          printer.connectionType
        ) === normalizedConnection
    );
  }

  // =====================================================
  // SAVE ALL PRINTER SETTINGS AT ONCE
  // =====================================================
  saveAll(configs) {
    if (!Array.isArray(configs)) {
      throw new Error(
        'Printer configurations must be an array'
      );
    }

    fs.mkdirSync(path.dirname(this.filePath), {
      recursive: true,
    });

    const normalizedConfigs = configs.map(
      (printer) => ({
        ...printer,
        role: this.normalizeRole(printer.role),
        connectionType:
          this.normalizeConnectionType(
            printer.connectionType
          ),
        active: printer.active === true,
      })
    );

    // Prevent multiple active connections for the same role.
    const activeRoles = new Set();

    for (const printer of normalizedConfigs) {
      if (!printer.active) continue;

      if (activeRoles.has(printer.role)) {
        throw new Error(
          `Multiple active printers configured for role ${printer.role}`
        );
      }

      activeRoles.add(printer.role);
    }

    fs.writeFileSync(
      this.filePath,
      JSON.stringify(normalizedConfigs, null, 2),
      'utf8'
    );

    return normalizedConfigs;
  }
}

module.exports = {
  PrinterSettingsRepository,
};




// const fs = require('fs');
// const path = require('path');
// const { app } = require('electron');

// class PrinterSettingsRepository {
//   constructor() {
//     this.filePath = path.join(
//       app.getPath('userData'),
//       'printers.json'
//     );
//   }

  

//   readAll() {
//     if (!fs.existsSync(this.filePath)) {
//       return [];
//     }

//     try {
//       const raw = fs.readFileSync(this.filePath, 'utf8');
//       return JSON.parse(raw);
//     } catch (e) {
//       console.error(
//         'Failed to read printers.json',
//         e
//       );
//       return [];
//     }
//   }

//   // getConfig(role) {
//   //   return this.readAll().find(
//   //     (p) => p.role === role
//   //   );
//   // }

//   getConfig(role) {
//   const configs = this.readAll().filter(
//     (printer) => printer.role === role
//   );

//   // Prefer the printer explicitly marked as active.
//   const activeConfig = configs.find(
//     (printer) => printer.active === true
//   );

//   // Backward compatibility for existing settings.
//   return activeConfig || configs[0] || null;
// }

//   saveConfig(config) {
//     const all = this.readAll().filter(
//       (p) => p.role !== config.role
//     );

//     all.push(config);

//     fs.mkdirSync(path.dirname(this.filePath), {
//   recursive: true,
// });

//     fs.writeFileSync(
//       this.filePath,
//       JSON.stringify(all, null, 2),
//       'utf8'
//     );
//   }
  

//  // =====================================================
//   // SAVE ALL PRINTER SETTINGS AT ONCE
//   // =====================================================
//   saveAll(configs) {
//     fs.mkdirSync(path.dirname(this.filePath), {
//       recursive: true,
//     });

//     fs.writeFileSync(
//       this.filePath,
//       JSON.stringify(configs, null, 2),
//       'utf8'
//     );

//     return configs;
//   }


// }




// module.exports = {
//   PrinterSettingsRepository,
  
// };