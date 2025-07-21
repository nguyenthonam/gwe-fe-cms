"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, Divider, Grid } from "@mui/material";
import { ICompany } from "@/types/typeCompany";
import { EnumChip } from "../Globals/EnumChip";

interface Props {
  open: boolean;
  onClose: () => void;
  customer: ICompany | null;
}

export default function CustomerDetailDialog({ open, onClose, customer }: Props) {
  if (!customer) return null;

  const formatDate = (date?: string | Date | null) => (date ? new Date(date).toLocaleDateString("en-GB") : "-");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }} color="primary">
        CUSTOMER DETAILS
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {/* MAIN INFO */}
          <Typography fontWeight={600}>Main Information</Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Code</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{customer.code}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Name</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{customer.name}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Address</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{customer.address}</Typography>
            </Grid>
          </Grid>

          {/* REPRESENTATIVE */}
          <Divider sx={{ my: 1 }} />
          <Typography fontWeight={600}>Representative</Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Full Name</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{customer.representative?.name}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Phone</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{customer.representative?.phone}</Typography>
            </Grid>
          </Grid>

          {/* CONTACT */}
          <Divider sx={{ my: 1 }} />
          <Typography fontWeight={600}>Contact Information</Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Email</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{customer.contact?.email}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Hotline</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{customer.contact?.hotline}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Website</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{customer.contact?.website}</Typography>
            </Grid>
          </Grid>

          {/* CONTRACT */}
          <Divider sx={{ my: 1 }} />
          <Typography fontWeight={600}>Contract Information</Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Tax Code</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{customer.taxCode}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Status</Typography>
            </Grid>
            <Grid size={8}>
              <EnumChip type="recordStatus" value={customer.status} />
            </Grid>
          </Grid>

          {/* CREATED AT */}
          {customer.createdAt && (
            <>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid size={4}>
                  <Typography variant="body2">Created At</Typography>
                </Grid>
                <Grid size={8}>
                  <Typography fontWeight={500}>{formatDate(customer.createdAt)}</Typography>
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
