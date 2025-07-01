"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Box } from "@mui/material";
import { COUNTRIES } from "@/utils/constants";

export default function ZoneDetailDialog({ open, onClose, carrier, groupZones = [] }: { open: boolean; onClose: () => void; carrier?: any; groupZones: any[] }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi tiết Group Zone {carrier ? `- ${carrier.name}` : ""}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {carrier && (
            <Typography variant="subtitle2" color="primary">
              Hãng: {carrier.name} ({carrier.code})
            </Typography>
          )}
          <Paper variant="outlined" sx={{ p: 1, overflow: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={40}>STT</TableCell>
                  <TableCell width={180}>Country</TableCell>
                  <TableCell width={100}>Country Code</TableCell>
                  <TableCell width={60}>Zone</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupZones.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">Không có zone nào!</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {groupZones.map((z, idx) => (
                  <TableRow key={z._id || idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{COUNTRIES.find((c) => c.code === z.countryCode)?.name || z.name || z.countryCode}</TableCell>
                    <TableCell>{z.countryCode}</TableCell>
                    <TableCell>{z.zone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Box flexGrow={1} />
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
