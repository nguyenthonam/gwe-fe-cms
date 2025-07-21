"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, CircularProgress, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import * as XLSX from "sheetjs-style";
import { useNotification } from "@/contexts/NotificationProvider";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getZoneGroupByCarrierApi, deleteZoneGroupByCarrierApi, lockZoneGroupByCarrierApi, unlockZoneGroupByCarrierApi } from "@/utils/apis/apiZone";
import CreateZoneDialog from "./CreateZoneDialog";
import UpdateZoneDialog from "./UpdateZoneDialog";
import ZoneDetailDialog from "./ZoneDetailDialog";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import { COUNTRIES } from "@/utils/constants";

export default function ZoneManagerView() {
  const [groups, setGroups] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [carrierIdFilter, setCarrierIdFilter] = useState("");
  const [carriers, setCarriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  useEffect(() => {
    getCarriersApi().then((res) => setCarriers(res?.data?.data?.data || []));
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      let filteredCarriers = carriers;
      if (carrierIdFilter) {
        filteredCarriers = carriers.filter((c) => c._id === carrierIdFilter);
      }
      if (keyword) {
        filteredCarriers = filteredCarriers.filter((c) => c.name.toLowerCase().includes(keyword.toLowerCase()));
      }

      const groupList: any[] = [];
      for (const carrier of filteredCarriers) {
        const res = await getZoneGroupByCarrierApi(carrier._id);
        const zones: any[] = res?.data?.data || [];
        if (zones.length > 0) {
          const allLocked = zones.every((z) => z.status === ERECORD_STATUS.Locked);
          groupList.push({
            id: carrier._id,
            carrier,
            zones,
            zoneCount: zones.length,
            status: allLocked ? ERECORD_STATUS.Locked : ERECORD_STATUS.Active,
          });
        }
      }
      setGroups(groupList);
      setTotal(groupList.length);
      // eslint-disable-next-line
    } catch (err) {
      showNotification("Failed to load zone groups!", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (carriers.length) fetchGroups();
  }, [carriers, carrierIdFilter, keyword]);

  const handleDeleteGroup = async (group: any) => {
    if (!window.confirm("Are you sure you want to delete this zone group?")) return;
    try {
      await deleteZoneGroupByCarrierApi(group.carrier._id);
      showNotification("Zone group deleted successfully!");
      fetchGroups();
    } catch (err: any) {
      showNotification(err.message || "Failed to delete zone group", "error");
    }
  };

  const handleLockUnlockGroup = async (group: any) => {
    try {
      if (group.status === ERECORD_STATUS.Locked) {
        await unlockZoneGroupByCarrierApi(group.carrier._id);
        showNotification("Zone group unlocked!", "success");
      } else {
        await lockZoneGroupByCarrierApi(group.carrier._id);
        showNotification("Zone group locked!", "success");
      }
      fetchGroups();
    } catch (err: any) {
      showNotification(err.message || "Lock/Unlock failed", "error");
    }
  };

  const exportGroupToExcel = (group: any) => {
    if (!group || !group.zones) {
      showNotification("No data to export!", "warning");
      return;
    }

    const data = group.zones.map((z: any) => {
      const countryObj = COUNTRIES.find((c) => c.code === z.countryCode);
      return {
        "COUNTRY NAME": countryObj?.name || "",
        "COUNTRY CODE": z.countryCode,
        ZONE: z.zone,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 26 }, { wch: 16 }, { wch: 10 }];

    const range = XLSX.utils.decode_range(ws["!ref"] || "");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell]) continue;
        const isHeader = R === 0;
        (ws[cell] as any).s = {
          font: {
            bold: isHeader,
            sz: isHeader ? 12 : 11,
          },
          alignment: {
            horizontal: isHeader ? "center" : "left",
            vertical: "center",
            wrapText: true,
          },
          border: {
            top: { style: "thin", color: { auto: 1 } },
            bottom: { style: "thin", color: { auto: 1 } },
            left: { style: "thin", color: { auto: 1 } },
            right: { style: "thin", color: { auto: 1 } },
          },
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `ZONE_${group.carrier?.name || ""}`);
    XLSX.writeFile(wb, `ZONE_GROUP_${group.carrier?.name || "SUB_CARRIER"}.xlsx`);
  };

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "DETAIL",
      flex: 1.2,
      renderCell: ({ row }: { row: any }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelectedGroup(row);
              setOpenDetailDialog(true);
            }}
          >
            View Detail
          </Typography>
        </Box>
      ),
    },
    {
      field: "carrier",
      headerName: "Sub Carrier",
      flex: 1.3,
      renderCell: ({ row }: { row: any }) => (
        <Box>
          <Typography fontWeight={500}>{row.carrier?.name}</Typography>
          <Typography fontSize={12} color="gray">
            {row.carrier?.code}
          </Typography>
        </Box>
      ),
    },
    {
      field: "zoneCount",
      headerName: "Zones",
      flex: 0.5,
      align: "center",
      renderCell: ({ row }) => (
        <Box display="flex" height={"100%"} justifyContent="center" alignItems="center">
          <Typography>{row.zoneCount}</Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: ({ row }) => (
        <Stack direction="row" height={"100%"} spacing={1} alignItems={"center"}>
          <Button size="small" startIcon={<Download />} onClick={() => exportGroupToExcel(row)}>
            Export Excel
          </Button>
          <ActionMenu
            onEdit={() => {
              setSelectedGroup(row);
              setOpenUpdateDialog(true);
            }}
            onLockUnlock={() => handleLockUnlockGroup(row)}
            onDelete={() => handleDeleteGroup(row)}
            status={row.zones?.length ? row.zones[0].status : undefined}
          />
        </Stack>
      ),
    },
  ];

  return (
    <Box className="space-y-4 p-6">
      <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between" alignItems="center">
        <TextField placeholder="Search zone..." size="small" onChange={(e) => debouncedSearch(e.target.value)} sx={{ minWidth: 220 }} />
        <Stack direction="row" spacing={1}>
          <Select size="small" value={carrierIdFilter} onChange={(e) => setCarrierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
            <MenuItem value="">All Sub Carriers</MenuItem>
            {carriers.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Create Zone Group
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={groups}
          columns={columns}
          paginationMode="server"
          rowCount={total}
          pageSizeOptions={[10, 20, 50, 100]}
          autoHeight
          getRowId={(row) => row.carrier._id}
          disableRowSelectionOnClick
        />
      )}

      <CreateZoneDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={fetchGroups} carriers={carriers} />
      {selectedGroup && (
        <>
          <UpdateZoneDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={fetchGroups} carriers={carriers} groupZones={selectedGroup.zones} />
          <ZoneDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} groupZones={selectedGroup.zones} carrier={selectedGroup.carrier} />
        </>
      )}
    </Box>
  );
}
