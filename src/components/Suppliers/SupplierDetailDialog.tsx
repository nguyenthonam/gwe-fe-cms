"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, Divider, Grid } from "@mui/material";
import { ISupplier } from "@/types/typeSupplier";
import { EnumChip } from "../Globals/EnumChip";

interface Props {
  open: boolean;
  onClose: () => void;
  supplier: ISupplier | null;
}

const formatDate = (date?: string | Date | null) => (date ? new Date(date).toLocaleDateString("en-GB") : "-");

export default function SupplierDetailDialog({ open, onClose, supplier }: Props) {
  if (!supplier) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }} color="primary">
        SUPPLIER DETAILS
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {/* BASIC INFO */}
          <Typography fontWeight={600}>Basic Information</Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Code</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{supplier.code}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Name</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{supplier.name}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Address</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{supplier.address}</Typography>
            </Grid>
          </Grid>

          {/* REPRESENTATIVE */}
          <Divider sx={{ my: 1 }} />
          <Typography fontWeight={600}>Representative</Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Name</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{supplier.representative?.name}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Phone</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{supplier.representative?.phone}</Typography>
            </Grid>
          </Grid>

          {/* CONTACT */}
          <Divider sx={{ my: 1 }} />
          <Typography fontWeight={600}>Contact</Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Email</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{supplier.contact?.email}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Hotline</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{supplier.contact?.hotline}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Website</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{supplier.contact?.website}</Typography>
            </Grid>
          </Grid>

          {/* CONTRACT */}
          <Divider sx={{ my: 1 }} />
          <Typography fontWeight={600}>Contract</Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Tax Code</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{supplier.taxCode}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Payment Terms</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{supplier.contract?.paymentTerms}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Status</Typography>
            </Grid>
            <Grid size={8}>
              <EnumChip type="recordStatus" value={supplier.status} />
            </Grid>
          </Grid>

          {/* CREATED AT */}
          {supplier.createdAt && (
            <>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid size={4}>
                  <Typography variant="body2">Created At</Typography>
                </Grid>
                <Grid size={8}>
                  <Typography fontWeight={500}>{formatDate(supplier.createdAt)}</Typography>
                </Grid>
              </Grid>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
